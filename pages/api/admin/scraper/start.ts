import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'
import { withAdminAuth } from '../../../../lib/middleware/withAdminAuth'
import logger from '../../../../lib/logger'
import { runScraper } from '../../../../scripts/master_scraper'
// import { getQueue } from '../../../../lib/queue'

const PID_PATH = path.join(process.cwd(), 'data', 'scraper_pid.json')
const LOG_PATH = path.join(process.cwd(), 'data', 'scraper.log')
const STOP_FLAG = path.join(process.cwd(), 'data', 'scraper_stop.flag')

let controllerRunning = false

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { terms } = req.body as { terms?: string | string[] }
  let termsArr: string[] = []
  if (!terms) return res.status(400).json({ error: 'terms required' })
  if (Array.isArray(terms)) termsArr = terms.map(t => String(t).trim()).filter(Boolean)
  else termsArr = String(terms).split(/\r?\n/).map(t => t.trim()).filter(Boolean)

  if (!termsArr.length) return res.status(400).json({ error: 'no search terms provided' })
  if (fs.existsSync(PID_PATH) || controllerRunning) return res.status(400).json({ error: 'Scraper already running' })

  // Single-process direct execution model: call the shared scraper entrypoint sequentially
  controllerRunning = true
  try {
    for (const term of termsArr) {
      if (fs.existsSync(STOP_FLAG)) break
      await runScraper(term)
    }

    return res.json({ ok: true, completedAt: new Date().toISOString(), termsCount: termsArr.length })
  } catch (e) {
    try {
      fs.appendFileSync(LOG_PATH, `\nStart error: ${String(e)}\n`)
    } catch (writeErr: unknown) {
      logger.error({ err: writeErr }, 'failed to append scraper start error')
    }
    return res.status(500).json({ error: String(e) })
  } finally {
    controllerRunning = false
  }
}

export default withAdminAuth(handler)
