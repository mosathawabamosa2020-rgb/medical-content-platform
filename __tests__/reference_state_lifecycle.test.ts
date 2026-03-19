import { assertTransition } from '../lib/referenceState'

describe('reference lifecycle sequence', () => {
  test('supports official ingestion sequence to pending review', () => {
    expect(() => assertTransition('pending_ingestion', 'processing')).not.toThrow()
    expect(() => assertTransition('processing', 'processed')).not.toThrow()
    expect(() => assertTransition('processed', 'pending_review')).not.toThrow()
  })

  test('rejects skipping processed stage', () => {
    expect(() => assertTransition('processing', 'pending_review')).toThrow(/Invalid transition/)
  })
})

