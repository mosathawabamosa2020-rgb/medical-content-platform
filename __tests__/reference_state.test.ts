import { assertTransition } from '../lib/referenceState'

describe('reference state machine', () => {
  const validPairs: Array<[string,string]> = [
    ['pending_ingestion','processing'],
    ['processing','processed'],
    ['processed','pending_review'],
    ['pending_review','verified'],
    ['pending_review','rejected']
  ]

  for (const [cur,next] of validPairs) {
    test(`allows ${cur} -> ${next}`, () => {
      expect(() => assertTransition(cur as any, next as any)).not.toThrow()
    })
  }

  const invalidPairs: Array<[string,string]> = [
    ['pending_ingestion','verified'],
    ['processing','verified'],
    ['processing','pending_review'],
    ['pending_review','processing'],
    ['verified','pending_review'],
    ['archived','pending_ingestion']
  ]

  // explicitly ensure transitions to 'archived' are rejected until approved
  const archivedForbidden: Array<[string,string]> = [
    ['pending_review','archived'],
    ['verified','archived'],
    ['rejected','archived']
  ]

  for (const [cur,next] of archivedForbidden) {
    test(`rejects forbidden archived transition ${cur} -> ${next}`, () => {
      expect(() => assertTransition(cur as any, next as any)).toThrow(/Invalid transition/)
    })
  }

  for (const [cur,next] of invalidPairs) {
    test(`rejects ${cur} -> ${next}`, () => {
      expect(() => assertTransition(cur as any, next as any)).toThrow(/Invalid transition/)
    })
  }
})
