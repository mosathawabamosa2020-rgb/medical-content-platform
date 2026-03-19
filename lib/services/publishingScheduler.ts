import prisma from '../prisma'

export async function scheduleDailyPublishingTasks(limit = 10) {
  const candidates = await prisma.device.findMany({
    where: { knowledgeComplete: true },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: { id: true, departmentId: true },
  })

  const scheduledAt = new Date()
  scheduledAt.setUTCHours(6, 0, 0, 0)

  const created: string[] = []
  for (const device of candidates) {
    const exists = await prisma.publishingTask.findFirst({
      where: {
        deviceId: device.id,
        scheduledDate: scheduledAt,
      },
      select: { id: true },
    })
    if (exists) continue
    const task = await prisma.publishingTask.create({
      data: {
        deviceId: device.id,
        departmentId: device.departmentId || null,
        taskType: 'daily_scientific_article',
        status: 'pending',
        scheduledDate: scheduledAt,
      },
      select: { id: true },
    })
    created.push(task.id)
  }
  return { createdCount: created.length, createdTaskIds: created }
}
