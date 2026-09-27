import type { Source } from "@news-reader/feeds";

interface QueueMessage {
  sources: Source[];
}

const BATCH_SIZE = 40;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const { results: sources } = await env.DB.prepare(
      "SELECT id, name, url, parser, category FROM sources WHERE enabled = 1",
    ).all<Source>();

    if (sources.length === 0) return;

    const batches = chunk(sources, BATCH_SIZE);
    await Promise.all(
      batches.map((batch) => env.FEED_QUEUE.send({ sources: batch } as QueueMessage)),
    );

    console.log(`Dispatched ${sources.length} sources in ${batches.length} batch(es)`);
  },
};
