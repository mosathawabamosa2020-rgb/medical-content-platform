#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')
const { PrismaClient } = require('@prisma/client')

const BASE_URL = process.env.PROOF_BASE_URL || 'http://127.0.0.1:3000'
const DEFAULT_AUTH_PATH = path.join(process.cwd(), 'playwright', 'auth.json')
const DEFAULT_OUT_PATH = path.join(process.cwd(), 'artifacts', 'rtl-audit', 'chromium_route_verification_2026-03-24.json')
const DEFAULT_SCREENSHOT_DIR = path.join(process.cwd(), 'artifacts', 'rtl-audit', 'screenshots')
const DEFAULT_ROUTE_TIMEOUT_MS = Number(process.env.RTL_ROUTE_TIMEOUT_MS || 15000)

const STATIC_ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/ingestion',
  '/admin/ingestion-monitor',
  '/admin/references',
  '/admin/references/upload',
  '/admin/research',
  '/admin/scraper',
  '/admin/settings',
  '/admin/sources',
  '/admin/taxonomy',
  '/admin/verification',
  '/admin/content',
  '/admin/content/create',
  '/admin/knowledge',
  '/admin/verification/references',
  '/admin/taxonomy/departments',
  '/admin/taxonomy/devices',
]

function parseArgs(argv) {
  const opts = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true'
    opts[key] = value
  }
  return opts
}

function sanitizeRoute(route) {
  if (route === '/') return 'root'
  return route.replace(/^\//, '').replace(/\//g, '__').replace(/[^a-zA-Z0-9_-]/g, '_')
}

async function ensureAuthState(browser, baseUrl, authPath, email, password) {
  if (fs.existsSync(authPath)) return
  if (!email || !password) {
    throw new Error(`Missing auth state at ${authPath}. Provide --email and --password to generate it.`)
  }

  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`${baseUrl}/api/auth/signin`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForLoadState('networkidle', { timeout: 30000 })
  await page.waitForURL((url) => !url.toString().includes('/api/auth/signin'), { timeout: 30000 })

  fs.mkdirSync(path.dirname(authPath), { recursive: true })
  await context.storageState({ path: authPath })
  await context.close()
}

async function loadDynamicAdminRoutes() {
  const prisma = new PrismaClient()
  await prisma.$connect()
  try {
    const [device, reference, section, department, model, generatedContent] = await Promise.all([
      prisma.device.findFirst({ select: { id: true }, orderBy: { createdAt: 'desc' } }),
      prisma.reference.findFirst({ select: { id: true }, orderBy: { uploadedAt: 'desc' } }),
      prisma.section.findFirst({ select: { id: true }, orderBy: { createdAt: 'desc' } }),
      prisma.department.findFirst({ select: { id: true }, orderBy: { createdAt: 'desc' } }),
      prisma.deviceModel.findFirst({ select: { id: true }, orderBy: { createdAt: 'desc' } }),
      prisma.generatedContent.findFirst({ select: { id: true }, orderBy: { createdAt: 'desc' } }),
    ])

    const missing = []
    if (!generatedContent?.id) missing.push('GeneratedContent')
    if (!reference?.id) missing.push('Reference')
    if (!device?.id) missing.push('Device')
    if (!section?.id) missing.push('Section')
    if (!department?.id) missing.push('Department')
    if (!model?.id) missing.push('DeviceModel')
    if (missing.length > 0) {
      throw new Error(`Missing dynamic route entities for RTL audit: ${missing.join(', ')}.`)
    }

    const dynamicRoutes = []
    dynamicRoutes.push(`/admin/content/${generatedContent.id}`)
    dynamicRoutes.push(`/admin/ingestion/${reference.id}`)
    dynamicRoutes.push(`/admin/knowledge/${device.id}`)
    dynamicRoutes.push(`/admin/references/${reference.id}`)
    dynamicRoutes.push(`/admin/sections/${section.id}`)
    dynamicRoutes.push(`/admin/taxonomy/departments/${department.id}`)
    dynamicRoutes.push(`/admin/taxonomy/devices/${device.id}`)
    dynamicRoutes.push(`/admin/taxonomy/models/${model.id}`)
    dynamicRoutes.push(`/admin/verification/${reference.id}`)
    dynamicRoutes.push(`/admin/verification/references/${reference.id}`)
    return dynamicRoutes
  } finally {
    await prisma.$disconnect()
  }
}

async function run() {
  const args = parseArgs(process.argv.slice(2))
  const baseUrl = args.baseUrl || BASE_URL
  const authPath = args.auth || DEFAULT_AUTH_PATH
  const outPath = args.out || DEFAULT_OUT_PATH
  const screenshotDir = args.screenshotDir || DEFAULT_SCREENSHOT_DIR
  const routeTimeoutMs = Number(args.timeoutMs || process.env.RTL_ROUTE_TIMEOUT_MS || DEFAULT_ROUTE_TIMEOUT_MS)
  const email = args.email || process.env.ADMIN_EMAIL || 'admin@example.test'
  const password = args.password || process.env.ADMIN_PASSWORD || 'AdminPass123!'
  const dynamicRoutes = await loadDynamicAdminRoutes()
  const adminRoutes = [...STATIC_ADMIN_ROUTES, ...dynamicRoutes]

  const browser = await chromium.launch()

  await ensureAuthState(browser, baseUrl, authPath, email, password)
  const context = await browser.newContext({ storageState: authPath })

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.mkdirSync(screenshotDir, { recursive: true })

  const results = []
  for (const route of adminRoutes) {
    const page = await context.newPage()
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => pageErrors.push(err.message))

    let status = null
    let ok = false
    let finalUrl = null
    let screenshot = null
    let errorMessage = null
    const url = `${baseUrl}${route}`
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: routeTimeoutMs })
      status = response ? response.status() : null
      ok = Boolean(response && response.ok())
      finalUrl = page.url()
      screenshot = path.join(screenshotDir, `${sanitizeRoute(route)}.png`)
      await page.screenshot({ path: screenshot, fullPage: true })
    } catch (error) {
      errorMessage = error?.message || String(error)
    }

    results.push({
      route,
      url,
      status,
      ok,
      finalUrl,
      screenshot,
      consoleErrors,
      pageErrors,
      errorMessage,
    })
    await page.close()
  }

  await context.close()
  await browser.close()

  const payload = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    authPath,
    routeTimeoutMs,
    routes: adminRoutes,
    results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      redirectedToSignin: results.filter((r) => typeof r.finalUrl === 'string' && r.finalUrl.includes('/api/auth/signin')).length,
    },
  }

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`Wrote authenticated Chromium verification artifact: ${outPath}`)
  console.log(JSON.stringify(payload.summary, null, 2))
}

run().catch((err) => {
  console.error('chromium verification failed', err)
  process.exit(1)
})
