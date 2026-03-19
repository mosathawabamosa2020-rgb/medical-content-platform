import PubMedAdapter from '../lib/sources/PubMedAdapter'
import SearchAggregatorService from '../lib/search/SearchAggregatorService'

jest.mock('../lib/sources/PubMedAdapter')

describe('SearchAggregatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns same results as PubMedAdapter when only one source', async () => {
    const fake = [{ id: '1', title: 'Test' }]
    ;(PubMedAdapter as jest.Mock).mockImplementation(() => ({ search: jest.fn().mockResolvedValue(fake) }))

    const svc = new SearchAggregatorService()
    const results = await svc.searchAll('foo')
    expect(results).toEqual(fake)
    expect(PubMedAdapter).toHaveBeenCalled()
  })

  test('aggregator combines results from multiple adapters if added', async () => {
    // temporarily patch service adapters array to simulate additional source
    const fake1 = [{ id: 'a', title: 'A' }]
    const fake2 = [{ id: 'b', title: 'B' }]
    ;(PubMedAdapter as jest.Mock).mockImplementation(() => ({ search: jest.fn().mockResolvedValue(fake1) }))

    class DummyAdapter {
      search(term: string) { return Promise.resolve(fake2) }
      fetchById() { return Promise.resolve(null) }
      fetchFullText() { return Promise.resolve(null) }
    }

    let svc: any = new SearchAggregatorService()
    // monkey-patch for test
    svc.adapters.push(new DummyAdapter())

    const results = await svc.searchAll('x')
    expect(results).toEqual([...fake1, ...fake2])
  })
})