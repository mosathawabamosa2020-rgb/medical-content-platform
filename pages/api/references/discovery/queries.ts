import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'

function generateQueries(name: string, model?: string) {
  const queries: string[] = []
  const base = model ? `${name} ${model}` : name
  queries.push(`"${base}" user manual pdf`)
  queries.push(`"${base}" operator's guide filetype:pdf`)
  queries.push(`site:siemens-healthineers.com "${base}" specifications`)
  queries.push(`"${base}" service manual pdf`)
  queries.push(`"${base}" "user manual" "pdf"`) 
  return queries
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { deviceId, name, model } = req.query
    let deviceName = name as string | undefined
    let deviceModel = model as string | undefined

    if (deviceId && !deviceName) {
      const device = await prisma.device.findUnique({ where: { id: deviceId as string } })
      if (device) {
        deviceName = device.name
        deviceModel = device.model
      }
    }

    if (!deviceName) return res.status(400).json({ error: 'deviceId or name required' })

    const queries = generateQueries(deviceName, deviceModel)
    return res.json({ queries })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
