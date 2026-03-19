import { hybridSearch } from '../search/hybrid.search'

export async function searchKnowledge(query: string, deviceId?: string) {
  return hybridSearch({ query, deviceId })
}

