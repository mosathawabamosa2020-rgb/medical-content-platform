import Home from '../pages/index'

describe('portal home page', () => {
  test('exports a component', () => {
    expect(typeof Home).toBe('function')
  })
})
