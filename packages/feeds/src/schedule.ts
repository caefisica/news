import type { Source, SourceKind } from "./types";

// The coordinator's cron period. Keep it equal to the schedule in its cloudflare.config.ts.
export const CRON_INTERVAL_MINUTES = 15;

// Instagram throttles datacenter IPs and a Worker is one, so it is asked less
// often than a feed. It must be a multiple of the cron period.
export const INSTAGRAM_INTERVAL_MINUTES = 60;

const INTERVAL_MINUTES: Record<SourceKind, number> = {
  feed: CRON_INTERVAL_MINUTES,
  instagram: INSTAGRAM_INTERVAL_MINUTES,
};

// Pick the sources to fetch on the cron run scheduled at `scheduledTime`
// (epoch milliseconds). It needs no stored state, and a failed fetch is not
// retried before the next interval.
export function dueSources(sources: Source[], scheduledTime: number): Source[] {
  const run = Math.floor(scheduledTime / (CRON_INTERVAL_MINUTES * 60_000));
  return sources.filter(
    (source) => run % (INTERVAL_MINUTES[source.kind] / CRON_INTERVAL_MINUTES) === 0,
  );
}
