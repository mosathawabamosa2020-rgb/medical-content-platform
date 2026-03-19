import pino from 'pino'

function createLogger(): pino.Logger {
  if (process.env.NODE_ENV === 'test') {
    return pino({ enabled: false })
  }
  if (process.env.NODE_ENV !== 'production') {
    try {
      // pino.transport exists in newer pino versions; cast to any to avoid TS issues
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const transport = (pino as any).transport ? (pino as any).transport({ target: 'pino-pretty', options: { colorize: true } }) : undefined
      return transport ? pino(transport) : pino()
    } catch {
      return pino()
    }
  }
  return pino()
}

const logger = createLogger()

export default logger
