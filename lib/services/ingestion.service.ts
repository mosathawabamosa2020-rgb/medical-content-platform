import { enqueueIngestionJob } from '../queue/queues'

export async function triggerIngestion(reason = 'manual') {
  return enqueueIngestionJob(reason)
}

