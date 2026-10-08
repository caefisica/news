import { processSource } from "@news-reader/feeds";
import type { Source } from "@news-reader/feeds";

interface QueueMessage {
  sources: Source[];
}

export default {
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      // Process queue messages sequentially to avoid overwhelming D1.
      // oxlint-disable-next-line no-await-in-loop
      const results = await Promise.allSettled(
        message.body.sources.map((s) => processSource(s, env.DB)),
      );
      // Retry the whole message when a database write rejects. Stored articles
      // are ignored when the message runs again.
      if (results.some((result) => result.status === "rejected")) {
        message.retry();
      } else {
        message.ack();
      }
    }
  },
};
