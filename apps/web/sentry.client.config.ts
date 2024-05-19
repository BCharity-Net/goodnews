import * as Sentry from '@sentry/nextjs';

Sentry.init({
  debug: false,
  dsn: 'https://88dba7b9cb70d4085c508247a4b155f2@o4507229179609088.ingest.us.sentry.io/4507281071341568',
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
