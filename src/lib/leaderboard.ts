const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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

type RedisResult<T> = { result?: T; error?: string };

function getEnv() {
  if (!REST_URL || !REST_TOKEN) {
    throw new Error('Missing Upstash REST credentials.');
  }
  return { url: REST_URL, token: REST_TOKEN };
}

async function redisCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  const { url, token } = getEnv();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify({ command: command.map((value) => value.toString()) }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upstash error: ${response.status} ${text}`);
  }

  const data = (await response.json()) as RedisResult<T>;

  if (data.error) {
    throw new Error(`Upstash error: ${data.error}`);
  }

  return (data.result ?? null) as T | null;
}

function pairsToObject(pairs: string[] | null): Record<string, string> {
  if (!pairs) return {};
  const obj: Record<string, string> = {};
  for (let i = 0; i < pairs.length; i += 2) {
    const key = pairs[i];
    const value = pairs[i + 1];
    if (key !== undefined && value !== undefined) {
      obj[key] = value;
    }
  }
  return obj;
}

/**
 * Submit a score for a player.
 *
 * - Sorted set (ZSET) keeps the **best score** for ranking.
 * - Hash per player stores metadata about the **best game**:
 *   - `score`: best score
 *   - `opponentScore`: opponent score from the best game
 *   - `updatedAt`: timestamp when best score was set
 */
export async function submitScore(payload: SubmitScorePayload): Promise<{ bestScore: number }> {
  const member = `player:${payload.fid}`;
  const playerKey = `farpong:player:${payload.fid}`;

  const currentScoreRaw = await redisCommand<string>(['ZSCORE', LEADERBOARD_KEY, member]);
  const currentScore =
    currentScoreRaw !== null && currentScoreRaw !== undefined ? Number(currentScoreRaw) : null;

  const isNewBest = currentScore === null || payload.score > currentScore;

  let bestScore: number;

  if (isNewBest) {
    await redisCommand(['ZADD', LEADERBOARD_KEY, payload.score, member]);
    bestScore = payload.score;
  } else {
    // currentScore cannot be null here because !isNewBest and we guard above
    bestScore = currentScore;
  }

  let opponentScoreToStore: number;
  let updatedAtToStore: string;

  if (isNewBest) {
    // Best score came from this game: use this game’s opponent score + timestamp
    opponentScoreToStore = payload.opponentScore;
    updatedAtToStore = Date.now().toString();
  } else {
    // Preserve opponent score and updatedAt from the game that set the existing best
    const existingHash = pairsToObject(await redisCommand<string[]>(['HGETALL', playerKey]));

    opponentScoreToStore =
      existingHash.opponentScore !== undefined
        ? Number(existingHash.opponentScore)
        : payload.opponentScore;

    // If we somehow had a score but no updatedAt yet, initialize it now
    updatedAtToStore = existingHash.updatedAt ?? Date.now().toString();
  }

  await redisCommand([
    'HSET',
    playerKey,
    'fid',
    payload.fid,
    'username',
    payload.username ?? '',
    'displayName',
    payload.displayName ?? '',
    'pfpUrl',
    payload.pfpUrl ?? '',
    'score',
    bestScore,
    'opponentScore',
    opponentScoreToStore,
    'updatedAt',
    updatedAtToStore,
  ]);

  return { bestScore };
}

export async function getTopEntries(limit = 10): Promise<LeaderboardEntry[]> {
  const clampedLimit = Math.max(1, Math.min(limit, 50));

  const range = await redisCommand<string[]>([
    'ZREVRANGE',
    LEADERBOARD_KEY,
    '0',
    (clampedLimit - 1).toString(),
    'WITHSCORES',
  ]);

  if (!range || range.length === 0) {
    return [];
  }

  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < range.length; i += 2) {
    const member = range[i];
    const scoreValue = range[i + 1];
    if (!member || !scoreValue) continue;

    const fid = Number(member.replace('player:', ''));
    const score = Number(scoreValue);

    const hash = pairsToObject(await redisCommand<string[]>(['HGETALL', `farpong:player:${fid}`]));

    entries.push({
      fid,
      score,
      opponentScore: Number(hash.opponentScore ?? 0),
      username: hash.username || undefined,
      displayName: hash.displayName || hash.username || undefined,
      pfpUrl: hash.pfpUrl || undefined,
      updatedAt: hash.updatedAt ? new Date(Number(hash.updatedAt)).toISOString() : undefined,
    });
  }

  return entries;
}
