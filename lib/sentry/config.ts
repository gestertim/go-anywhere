const sensitiveKeys = new Set(["title", "address", "notes", "confirmation_code", "access_token", "requestBody", "confirmationCode"]);

export function getSentryOptions() {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
  };
}

export function scrubValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrubValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !sensitiveKeys.has(key)).map(([key, nested]) => [key, scrubValue(nested)]));
}