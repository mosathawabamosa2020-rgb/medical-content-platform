import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import logger from '../../../../lib/logger'

const LOG_PATH = path.join(process.cwd(), 'data', 'scraper.log')

function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, '')

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // send last chunk
  try {
    const tail = fs.readFileSync(LOG_PATH, 'utf8').slice(-20000)
    if (tail) res.write(`data: ${JSON.stringify(tail)}\n\n`)
  } catch (e: unknown) {
    logger.warn({ err: e }, 'failed to read initial scraper log tail')
  }

  let lastSize = fs.statSync(LOG_PATH).size
  if (!lastSize) lastSize = 0

  const watcher = fs.watch(LOG_PATH, () => {
    try {
      const stats = fs.statSync(LOG_PATH)
      if (stats.size > lastSize) {
        const stream = fs.createReadStream(LOG_PATH, { start: lastSize, end: stats.size - 1, encoding: 'utf8' })
        let buf = ''
        stream.on('data', (c) => { buf += c })
        stream.on('end', () => {
          lastSize = stats.size
          // send as single event
          res.write(`data: ${JSON.stringify(buf)}\n\n`)
        })
      }
    } catch { /* ignore */ }
  })

  req.on('close', () => {
    try {
      watcher.close()
    } catch (e: unknown) {
      logger.warn({ err: e }, 'failed to close scraper log watcher')
    }
    res.end()
  })
  return
}

export default withAdminAuth(handler)
