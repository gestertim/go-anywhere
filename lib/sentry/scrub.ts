import { scrubValue } from "@/lib/sentry/config";

export function scrubEvent<T extends Record<string, unknown>>(event: T): T {
  return scrubValue(event) as T;
}
