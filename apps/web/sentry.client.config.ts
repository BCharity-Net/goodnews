import * as Sentry from '@sentry/nextjs';

Sentry.init({
  debug: false,
  dsn: 'https://789bc5c061a50abc28b8776d305a3c89@o4507284811808768.ingest.us.sentry.io/4507284816003072',
  enabled: process.env.NODE_ENV === 'production',
  ignoreErrors: [
    'ResizeObserver loop completed with undelivered notifications.',
    'ResizeObserver loop limit exceeded',
    'User rejected the request',
    'wss://relay.walletconnect.org',
    'To use QR modal, please install @walletconnect/modal package',
    'No matching key',
    'unknown ProviderEvent',
    'No internet connection detected'
  ],
  tracesSampleRate: 1
});
