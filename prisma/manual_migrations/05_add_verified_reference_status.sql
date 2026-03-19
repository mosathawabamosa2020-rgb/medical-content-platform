-- migration: add verified value to ReferenceStatus enum

DO $$
BEGIN
    -- only add if not already present
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'ReferenceStatus' AND e.enumlabel = 'verified'
    ) THEN
        ALTER TYPE "ReferenceStatus" ADD VALUE 'verified';
    END IF;
END$$;
