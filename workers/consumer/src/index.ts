import { processSource } from "@news-reader/feeds";
import type { Source } from "@news-reader/feeds";

interface QueueMessage {
  sources: Source[];
}

export default {
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      /* eslint-disable-next-line no-await-in-loop -- sequential per-message processing prevents overwhelming D1 */
      await Promise.allSettled(message.body.sources.map((s) => processSource(s, env.DB)));
      message.ack();
    }
  },
};
