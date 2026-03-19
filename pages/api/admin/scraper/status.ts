import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { withAdminAuth } from '../../../../lib/adminAuth'

const PID_PATH = path.join(process.cwd(), 'data', 'scraper_pid.json')
const LOG_PATH = path.join(process.cwd(), 'data', 'scraper.log')
const STOP_FLAG = path.join(process.cwd(), 'data', 'scraper_stop.flag')

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const status: any = { running: false }
  if (fs.existsSync(PID_PATH)) {
    const info = JSON.parse(fs.readFileSync(PID_PATH, 'utf8'))
    status.running = true
    status.info = info
  }
  if (fs.existsSync(STOP_FLAG)) status.stopRequested = true
  if (fs.existsSync(LOG_PATH)) status.log = fs.readFileSync(LOG_PATH, 'utf8').slice(-20000)
  return res.json(status)
}

export default withAdminAuth(handler)
