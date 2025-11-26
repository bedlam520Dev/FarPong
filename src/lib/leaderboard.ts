import { Redis } from '@upstash/redis';

// Define a minimal interface for the Upstash Redis client methods we use. This
// helps satisfy TypeScript and ESLint rules about unsafe calls by giving
// explicit type signatures for each command. Without this, the generic type
// parameters on the Redis class default to `unknown`, which makes calls like
// `redis.zrange()` and `redis.zscore()` appear unsafe.
type UpstashRedis = {
  /**
   * Fetch the score for a sorted set member.
   */
  zscore: (key: string, member: string) => Promise<number | null>;
  /**
   * Add a member with a score to a sorted set.
   */
  zadd: (key: string, data: { score: number; member: string }) => Promise<number | null | void>;
  /**
   * Get a range of members (and optionally scores) from a sorted set.
   */
  zrange: (
    key: string,
    start: number,
    stop: number,
    options: { withScores: boolean; rev: boolean },
  ) => Promise<(string | number)[]>;
  /**
   * Set multiple hash fields.
   */
  hset: (key: string, data: Record<string, string>) => Promise<number | void>;
  /**
   * Get all fields from a hash.
   */
  hgetall: <T extends Record<string, string>>(key: string) => Promise<T | null>;
};

// Create a Redis client and cast it to the typed interface. The cast through
// `unknown` prevents the generic type parameters of Redis from being inferred as
// `never` or `unknown`, which would make method calls unsafe.
const redis: UpstashRedis = Redis.fromEnv() as unknown as UpstashRedis;

// Create a Redis client using environment variables. This automatically picks
// up UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_* aliases) from
// the runtime environment. If these variables are missing or invalid, Redis.fromEnv()
// will throw at import time, surfacing misconfiguration early.

const LEADERBOARD_KEY = 'farpong:leaderboard';

export interface SubmitScorePayload {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  score: number;
  opponentScore: number;
}

export interface LeaderboardEntry {
  fid: number;
  score: number;
  opponentScore: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  updatedAt?: string;
}

/**
 * Submit a score for a player.
 *
 * The sorted set (ZSET) keeps the best score per player for ranking. A separate
 * hash per player stores metadata about the game that produced the best score.
 */
export async function submitScore(payload: SubmitScorePayload): Promise<{ bestScore: number }> {
  const member = `player:${payload.fid}`;
  const playerKey = `farpong:player:${payload.fid}`;

  // Read the current best score for this member from the sorted set. If the
  // member does not exist, zscore returns null. We avoid using a generic here
  // because the Upstash client type parameter expects an array type.
  const currentScoreRaw = await redis.zscore(LEADERBOARD_KEY, member);
  const currentScore =
    currentScoreRaw !== null && currentScoreRaw !== undefined ? currentScoreRaw : null;
  const isNewBest = currentScore === null || payload.score > currentScore;
  let bestScore: number;

  if (isNewBest) {
    // If this game beats the previous best, add/update the sorted set. Upstash
    // uses HTTP, so there's no need for a persistent connection.
    await redis.zadd(LEADERBOARD_KEY, { score: payload.score, member });
    bestScore = payload.score;
  } else {
    // Otherwise, keep the existing best (cannot be null here).
    bestScore = Number(currentScore);
  }

  let opponentScoreToStore: number;
  let updatedAtToStore: string;

  if (isNewBest) {
    // Best score came from this game: use this game’s opponent score and timestamp.
    opponentScoreToStore = payload.opponentScore;
    updatedAtToStore = Date.now().toString();
  } else {
    // Preserve opponent score and updatedAt from the game that set the existing best.
    const existingHash = await redis.hgetall<Record<string, string>>(playerKey);
    opponentScoreToStore =
      existingHash?.opponentScore !== undefined
        ? Number(existingHash.opponentScore)
        : payload.opponentScore;
    updatedAtToStore = existingHash?.updatedAt ?? Date.now().toString();
  }

  // Upstash Redis client accepts a record of field/value pairs for HSET. All values
  // must be strings.
  await redis.hset(playerKey, {
    fid: payload.fid.toString(),
    username: payload.username ?? '',
    displayName: payload.displayName ?? '',
    pfpUrl: payload.pfpUrl ?? '',
    score: bestScore.toString(),
    opponentScore: opponentScoreToStore.toString(),
    updatedAt: updatedAtToStore,
  });

  return { bestScore };
}

/**
 * Fetch the top leaderboard entries, sorted by best score descending. The limit
 * is clamped between 1 and 50 to prevent excessively large queries.
 */
export async function getTopEntries(limit = 10): Promise<LeaderboardEntry[]> {
  const clampedLimit = Math.max(1, Math.min(limit, 50));
  // Use zrange with rev:true and withScores:true to get members and scores in
  // descending order. The response is an array like [member1, score1, member2, score2, ...].
  const range = await redis.zrange(LEADERBOARD_KEY, 0, clampedLimit - 1, {
    withScores: true,
    rev: true,
  });
  if (!range || range.length === 0) {
    return [];
  }
  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < range.length; i += 2) {
    // Cast the member and score values to strings before using string methods.
    const memberRaw = range[i];
    const scoreRaw = range[i + 1];
    if (!memberRaw || scoreRaw === undefined) continue;
    const memberStr = String(memberRaw);
    const scoreStr = String(scoreRaw);
    // Remove the "player:" prefix from the member string to extract the fid.
    const fid = Number(memberStr.replace('player:', ''));
    const score = Number(scoreStr);
    // Fetch player metadata as a hash. hgetall returns an object mapping field
    // names to string values. Missing fields are omitted.
    const hash = await redis.hgetall<Record<string, string>>(`farpong:player:${fid}`);
    entries.push({
      fid,
      score,
      opponentScore: Number(hash?.opponentScore ?? 0),
      username: hash?.username || undefined,
      displayName: hash?.displayName || hash?.username || undefined,
      pfpUrl: hash?.pfpUrl || undefined,
      updatedAt: hash?.updatedAt ? new Date(Number(hash.updatedAt)).toISOString() : undefined,
    });
  }
  return entries;
}
