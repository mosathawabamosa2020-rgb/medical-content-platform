#!/bin/bash

# Database Seeding Script

set -e

echo "Starting database seeding..."

# Run seed script
npx ts-node prisma/seed.ts

if [ $? -eq 0 ]; then
  echo "✅ Database seeding completed successfully!"
else
  echo "❌ Database seeding failed!"
  exit 1
fi