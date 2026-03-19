/**
 * Deprecated: Reference.embedding has been removed from the model.
 * If vector migration is required, update this script to target Section embeddings.
 *
 * Usage: node scripts/migrate_vectors.js
 */
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

async function main() {
  console.error('Deprecated script: Reference.embedding no longer exists. Update to Section embeddings if needed.')
  process.exit(1)
}

main().catch((e) => { console.error(e); process.exit(1) })
