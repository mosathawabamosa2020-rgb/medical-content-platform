import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/adminAuth'
import { scheduleDailyPublishingTasks } from '../../../../lib/services/publishingScheduler'
import { writeAuditEvent } from '../../../../lib/auditTrail'

async function handler(req: NextApiRequest, res: NextApiResponse, session?: any) {
  if (req.method !== 'POST') return res.status(405).end()
  const limit = Number(req.body?.limit || 10)
  const result = await scheduleDailyPublishingTasks(Number.isFinite(limit) ? limit : 10)
  writeAuditEvent({
    event: 'publishing.schedule.executed',
    actorId: String(session?.user?.id || ''),
    entityType: 'publishingTask',
    entityId: 'bulk',
    payload: { limit, createdCount: result.createdCount },
  })
  return res.status(200).json(result)
}

export default withAdminAuth(handler)
