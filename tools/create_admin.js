require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const argv = require('minimist')(process.argv.slice(2))
  const email = argv.email || process.env.ADMIN_EMAIL
  const password = argv.password || process.env.ADMIN_PASSWORD
  const name = argv.name || process.env.ADMIN_NAME || 'Administrator'

  if (!email || !password) {
    console.error('Usage: node tools/create_admin.js --email admin@org --password secret [--name "Admin"]')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  await prisma.$connect()
  try {
    const hashed = await bcrypt.hash(password, 10)
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      await prisma.user.update({ where: { email }, data: { name, password: hashed, role: 'admin' } })
      console.log('Updated existing user to admin:', email)
    } else {
      await prisma.user.create({ data: { email, name, password: hashed, role: 'admin' } })
      console.log('Created new admin user:', email)
    }
  } catch (e) {
    console.error('Failed to create admin user:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
