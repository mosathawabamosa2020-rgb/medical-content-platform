export type StatusColor = 'green' | 'yellow' | 'red' | 'orange' | 'slate'

const STATUS_MAP: Record<string, StatusColor> = {
  ACCEPTED: 'green',
  APPROVED: 'green',
  PUBLISHED: 'green',
  UNDER_REVIEW: 'yellow',
  PENDING: 'yellow',
  SCHEDULED: 'yellow',
  REJECTED: 'red',
  FAILED: 'red',
  REQUIRES_REVISION: 'orange',
  DRAFT: 'slate',
}

export function getStatusColor(status: string): StatusColor {
  const normalized = String(status || '').trim().toUpperCase()
  return STATUS_MAP[normalized] || 'slate'
}
