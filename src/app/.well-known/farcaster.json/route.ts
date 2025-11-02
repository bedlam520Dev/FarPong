import { METADATA } from '../../../lib/utils';

export function GET(): Response {
  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjMxMTgyMiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDg0ZEE3MTJhMjY4MDY2QjM0ZTJmMzI2NjlGRjVBNjI2MDA1Qzk3ZTEifQ',
      payload: 'eyJkb21haW4iOiJsaXZlLWhvcGUtOTU1LmFwcC5vaGFyYS5haSJ9',
      signature:
        'UBaJ3XMlnAe6VGKMj9gVwNZOkk45D8HioiwSmMEqNm5iFrLu/d7wXU7vMYsNJhwknKSi42JrIlfdRtdhr0cOSBs=',
    },
    baseBuilder: {
      allowedAddresses: ['0x835d8806E9Ea719c6A67a98c687FCfa117fee29F'],
    },
    frame: {
      version: '1',
      name: METADATA.name,
      iconUrl: METADATA.iconImageUrl,
      splashImageUrl: METADATA.splashImageUrl,
      splashBackgroundColor: METADATA.splashBackgroundColor,
      homeUrl: METADATA.homeUrl,
      webhookUrl: METADATA.webhookUrl,
      subtitle: METADATA.subtitle,
      description: METADATA.description,
      screenshotUrls: METADATA.screenshotUrls,
      primaryCategory: 'games',
      tags: ['game', 'pong', 'retro', 'farcaster', 'base'],
      heroImageUrl: METADATA.bannerImageUrl,
      tagline: METADATA.name,
      ogTitle: METADATA.name,
      ogDescription: METADATA.description,
      ogImageUrl: METADATA.bannerImageUrl,
      noindex: false,
      requiredCapabilities: [
        'actions.ready',
        'actions.addMiniApp',
        'actions.close',
        'actions.composeCast',
        'actions.getCapabilities',
        'actions.getChains',
        'actions.haptics',
        'actions.openMiniApp',
        'actions.openUrl',
        'actions.quickAuth',
        'actions.requestCameraMicrophone',
        'actions.sendToken',
        'actions.setPrimaryButton',
        'actions.signIn',
        'actions.swapToken',
        'actions.viewCast',
        'actions.viewProfile',
        'actions.viewToken',
        'wallet.getEthereumProvider',
      ],
      requiredChains: ['eip155:8453'],
      canonicalDomain: 'live-hope-955.app.ohara.ai',
    },
  };

  return Response.json(config);
}
