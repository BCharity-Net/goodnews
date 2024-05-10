import * as Sentry from '@sentry/nextjs';

Sentry.init({
  debug: false,
  dsn: 'https://22b6411db8917b93c6ab540c2e10d013@o4507229179609088.ingest.us.sentry.io/4507229181902848',
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
