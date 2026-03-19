@echo off
REM Execute Database Seeding

cd /d "C:\Users\mosat\medical-content-platform"

echo Starting database seeding...

npx ts-node prisma/seed.ts

if %errorlevel% equ 0 (
    echo Database seeding completed successfully!
    echo Press any key to continue...
    pause
) else (
    echo Database seeding failed!
    pause
    exit /b 1
)