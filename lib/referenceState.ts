export type ReferenceStatus =
  | 'pending_ingestion'
  | 'processing'
  | 'processed'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'archived'

const allowedTransitions: Record<ReferenceStatus, ReferenceStatus[]> = {
  pending_ingestion: ['processing'],
  processing: ['processed'],
  processed: ['pending_review'],
  // archived is reserved and currently unreachable via normal transitions
  pending_review: ['verified', 'rejected'],
  verified: [],
  rejected: [],
  archived: []
}

export function assertTransition(current: ReferenceStatus, next: ReferenceStatus) {
  if (!allowedTransitions[current].includes(next)) {
    throw new Error(`Invalid transition: ${current} -> ${next}`)
  }
}
