import * as Sentry from '@sentry/nextjs';

Sentry.init({
  debug: false,
  dsn: 'https://22b6411db8917b93c6ab540c2e10d013@o4507229179609088.ingest.us.sentry.io/4507229181902848',
  enabled: false,
  tracesSampleRate: 1
});
