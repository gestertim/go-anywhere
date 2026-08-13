import * as Sentry from "@sentry/nextjs";
import { getSentryOptions, scrubValue } from "@/lib/sentry/config";

export function initSentryClient() {
  const options = getSentryOptions();
  if (options.dsn) Sentry.init({ ...options, beforeSend: (event) => scrubValue(event) as typeof event });
}
