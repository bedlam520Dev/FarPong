import { METADATA } from '../../../lib/utils';

export function GET(): Response {
  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjMxMTgyMiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGRlY2U0OWVGMDhBNzVmMDI0OTlkOTY1YTM2ZUVBRWZGQ2REM0Q0ODMifQ',
      payload: 'eyJkb21haW4iOiJmYXJwb25nLnZlcmNlbC5hcHAifQ',
      signature:
        'hpWLp0jK4F8XDhiPAvGOunPGnGMLK505MqO0RY9W4Ugzzqlu4pkjtx2XmHEMtg1cj41NINIDMQOWcL2OlXaPRxw=',
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
      canonicalDomain: 'https://farpong.vercel.app',
    },
  };

  return Response.json(config);
}
