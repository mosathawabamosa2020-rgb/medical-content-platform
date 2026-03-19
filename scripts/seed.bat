@echo off
REM Database Seeding Script

setlocal enabledelayedexpansion

echo Starting database seeding...

REM Run seed script
npx ts-node prisma/seed.ts

if %errorlevel% equ 0 (
    echo Database seeding completed successfully!
) else (
    echo Database seeding failed!
    exit /b 1
)