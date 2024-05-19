import * as Sentry from '@sentry/nextjs';

Sentry.init({
  debug: false,
  dsn: 'https://789bc5c061a50abc28b8776d305a3c89@o4507284811808768.ingest.us.sentry.io/4507284816003072',
  enabled: false,
  tracesSampleRate: 1
});
