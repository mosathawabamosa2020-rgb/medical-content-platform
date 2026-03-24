-- Patch migration: normalize User.role enum type to "UserRole" with lowercase values
-- Handles legacy states where "Role" exists, or "UserRole" exists with uppercase labels.

DO $$
DECLARE
  has_userrole BOOLEAN;
  has_legacy_role BOOLEAN;
  has_userrole_old BOOLEAN;
  uppercase_label_count INTEGER := 0;
  current_role_type TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'UserRole'
  ) INTO has_userrole;

  IF has_userrole THEN
    SELECT COUNT(*)
    INTO uppercase_label_count
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'UserRole'
      AND e.enumlabel <> LOWER(e.enumlabel);

    IF uppercase_label_count > 0 THEN
      EXECUTE 'ALTER TYPE "UserRole" RENAME TO "UserRole_old"';
      has_userrole_old := TRUE;
      has_userrole := FALSE;
    END IF;
  END IF;

  IF NOT has_userrole THEN
    EXECUTE 'CREATE TYPE "UserRole" AS ENUM (''admin'', ''reviewer'', ''editor'')';
  END IF;

  SELECT t.typname
  INTO current_role_type
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_type t ON t.oid = a.atttypid
  WHERE n.nspname = 'public'
    AND c.relname = 'User'
    AND a.attname = 'role'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  IF current_role_type IS NOT NULL AND current_role_type <> 'UserRole' THEN
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT';
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING LOWER("role"::text)::"UserRole"';
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT ''editor''::"UserRole"';
  ELSE
    -- Keep default aligned even if type is already correct.
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT ''editor''::"UserRole"';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'Role'
  ) INTO has_legacy_role;

  IF has_legacy_role THEN
    EXECUTE 'DROP TYPE "Role"';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'UserRole_old'
  ) INTO has_userrole_old;

  IF has_userrole_old THEN
    EXECUTE 'DROP TYPE "UserRole_old"';
  END IF;
END $$;
