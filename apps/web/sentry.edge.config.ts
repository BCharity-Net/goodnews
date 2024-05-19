import * as Sentry from '@sentry/nextjs';

Sentry.init({
  debug: false,
  dsn: 'https://88dba7b9cb70d4085c508247a4b155f2@o4507229179609088.ingest.us.sentry.io/4507281071341568',
  enabled: false,
  tracesSampleRate: 1
});
