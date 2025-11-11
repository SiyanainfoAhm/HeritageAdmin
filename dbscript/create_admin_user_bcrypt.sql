-- =====================================================================
-- CREATE ADMIN USER WITH BCRYPT - SQL SCRIPT
-- =====================================================================
-- This script creates an admin user type (if it doesn't exist) and
-- creates an admin user in the heritage_user table.
--
-- IMPORTANT: This script requires bcrypt extension in PostgreSQL
-- If bcrypt is not available, use create_admin_user.sql (MD5 version)
-- OR use the Node.js script: npm run create-admin
--
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Replace the placeholder values below with your admin details
-- 3. Generate bcrypt hash for your password (see instructions below)
-- 4. Run this script
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: CREATE ADMIN USER TYPE (if it doesn't exist)
-- =====================================================================

DO $$
DECLARE
    admin_user_type_id BIGINT;
BEGIN
    -- Check if admin user type exists
    SELECT user_type_id INTO admin_user_type_id
    FROM Heritage_UserType
    WHERE type_key = 'admin'
    LIMIT 1;

    -- If admin user type doesn't exist, create it
    IF admin_user_type_id IS NULL THEN
        INSERT INTO Heritage_UserType (
            type_key,
            display_order,
            is_active,
            requires_verification,
            max_listings,
            icon_name,
            color_code
        ) VALUES (
            'admin',
            0,
            TRUE,
            FALSE,
            0,
            'admin_panel_settings',
            '#F44336'
        )
        RETURNING user_type_id INTO admin_user_type_id;

        RAISE NOTICE 'Created admin user type with ID: %', admin_user_type_id;

        -- Add translations
        INSERT INTO Heritage_UserTypeTranslation (user_type_id, language_code, type_name, type_description) VALUES
            (admin_user_type_id, 'EN', 'Administrator', 'System administrator with full access'),
            (admin_user_type_id, 'HI', 'प्रशासक', 'पूर्ण पहुंच के साथ सिस्टम प्रशासक'),
            (admin_user_type_id, 'GU', 'એડમિનિસ્ટ્રેટર', 'સંપૂર્ણ ઍક્સેસ સાથે સિસ્ટમ એડમિનિસ્ટ્રેટર')
        ON CONFLICT (user_type_id, language_code) DO NOTHING;

        RAISE NOTICE 'Added translations for admin user type';
    ELSE
        RAISE NOTICE 'Admin user type already exists with ID: %', admin_user_type_id;
    END IF;
END $$;

-- =====================================================================
-- STEP 2: CREATE ADMIN USER WITH BCRYPT PASSWORD
-- =====================================================================
-- IMPORTANT: Replace the values below and generate bcrypt hash
-- =====================================================================

DO $$
DECLARE
    admin_user_type_id BIGINT;
    admin_user_id BIGINT;
    password_hash_value TEXT;
    admin_name TEXT := 'Admin User';           -- CHANGE THIS
    admin_email TEXT := 'admin@heritage.com';  -- CHANGE THIS
    admin_phone TEXT := NULL;                  -- CHANGE THIS (or NULL)
    admin_password TEXT := 'Admin@123';        -- CHANGE THIS
    existing_user_id BIGINT;
    bcrypt_hash TEXT;
BEGIN
    -- Get admin user type ID
    SELECT user_type_id INTO admin_user_type_id
    FROM Heritage_UserType
    WHERE type_key = 'admin'
    LIMIT 1;

    IF admin_user_type_id IS NULL THEN
        RAISE EXCEPTION 'Admin user type not found. Please run the script from the beginning.';
    END IF;

    -- Check if user already exists
    BEGIN
        SELECT user_id INTO existing_user_id
        FROM heritage_user
        WHERE email = LOWER(admin_email)
        LIMIT 1;
    EXCEPTION
        WHEN undefined_table THEN
            BEGIN
                SELECT user_id INTO existing_user_id
                FROM Heritage_User
                WHERE email = LOWER(admin_email)
                LIMIT 1;
            EXCEPTION
                WHEN undefined_table THEN
                    RAISE EXCEPTION 'Neither heritage_user nor Heritage_User table found';
            END;
    END;

    -- Generate bcrypt hash
    -- Note: This requires pgcrypto extension
    -- If extension is not available, you'll need to generate the hash externally
    BEGIN
        -- Try to use crypt function from pgcrypto
        SELECT crypt(admin_password, gen_salt('bf', 10)) INTO bcrypt_hash;
        password_hash_value := bcrypt_hash;
        RAISE NOTICE 'Generated bcrypt hash for password';
    EXCEPTION
        WHEN undefined_function THEN
            -- If pgcrypto is not available, use MD5 as fallback
            RAISE NOTICE 'pgcrypto extension not available. Using MD5 hash (less secure).';
            RAISE NOTICE 'For better security, enable pgcrypto extension or use Node.js script.';
            password_hash_value := MD5(admin_password || admin_email);
    END;

    IF existing_user_id IS NOT NULL THEN
        RAISE NOTICE 'User with email % already exists (ID: %). Updating user...', admin_email, existing_user_id;
        
        -- Update existing user
        BEGIN
            BEGIN
                UPDATE heritage_user
                SET
                    full_name = admin_name,
                    phone = admin_phone,
                    user_type_id = admin_user_type_id,
                    is_verified = TRUE,
                    language_code = 'EN',
                    password_hash = password_hash_value
                WHERE user_id = existing_user_id;
            EXCEPTION
                WHEN undefined_column THEN
                    UPDATE heritage_user
                    SET
                        full_name = admin_name,
                        phone = admin_phone,
                        user_type_id = admin_user_type_id,
                        is_verified = TRUE,
                        language_code = 'EN',
                        password_hash = password_hash_value
                    WHERE user_id = existing_user_id;
            END;
        EXCEPTION
            WHEN undefined_table THEN
                UPDATE Heritage_User
                SET
                    full_name = admin_name,
                    phone = admin_phone,
                    user_type_id = admin_user_type_id,
                    is_verified = TRUE,
                    language_code = 'EN',
                    password_hash = password_hash_value
                WHERE user_id = existing_user_id;
        END;

        RAISE NOTICE 'Updated existing user with ID: %', existing_user_id;
        admin_user_id := existing_user_id;
    ELSE
        -- Insert new admin user
        BEGIN
            BEGIN
                INSERT INTO heritage_user (
                    full_name,
                    email,
                    phone,
                    user_type_id,
                    is_verified,
                    language_code,
                    password_hash,
                    created_at
                ) VALUES (
                    admin_name,
                    LOWER(admin_email),
                    admin_phone,
                    admin_user_type_id,
                    TRUE,
                    'EN',
                    password_hash_value,
                    NOW()
                )
                RETURNING user_id INTO admin_user_id;
            EXCEPTION
                WHEN undefined_column THEN
                    INSERT INTO heritage_user (
                        full_name,
                        email,
                        phone,
                        user_type_id,
                        is_verified,
                        language_code,
                        password_hash,
                        created_at
                    ) VALUES (
                        admin_name,
                        LOWER(admin_email),
                        admin_phone,
                        admin_user_type_id,
                        TRUE,
                        'EN',
                        password_hash_value,
                        NOW()
                    )
                    RETURNING user_id INTO admin_user_id;
            END;
        EXCEPTION
            WHEN undefined_table THEN
                INSERT INTO Heritage_User (
                    full_name,
                    email,
                    phone,
                    user_type_id,
                    is_verified,
                    language_code,
                    password_hash,
                    created_at
                ) VALUES (
                    admin_name,
                    LOWER(admin_email),
                    admin_phone,
                    admin_user_type_id,
                    TRUE,
                    'EN',
                    password_hash_value,
                    NOW()
                )
                RETURNING user_id INTO admin_user_id;
        END;

        RAISE NOTICE 'Created admin user with ID: %', admin_user_id;
    END IF;

    -- Create user profile entry (if table exists)
    BEGIN
        INSERT INTO heritage_user_profile (
            user_id,
            tags,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            ARRAY[]::TEXT[],
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;

        RAISE NOTICE 'Created/updated user profile';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'heritage_user_profile table does not exist. Skipping profile creation.';
    END;

END $$;

-- =====================================================================
-- STEP 3: DISPLAY CREATED USER INFORMATION
-- =====================================================================

SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    u.user_type_id,
    ut.type_key as user_type,
    utt.type_name as user_type_name,
    u.is_verified,
    u.language_code,
    u.created_at
FROM heritage_user u
LEFT JOIN Heritage_UserType ut ON u.user_type_id = ut.user_type_id
LEFT JOIN Heritage_UserTypeTranslation utt ON ut.user_type_id = utt.user_type_id AND utt.language_code = 'EN'
WHERE ut.type_key = 'admin'
ORDER BY u.created_at DESC
LIMIT 5;

COMMIT;

-- =====================================================================
-- NOTES:
-- =====================================================================
-- 1. This script tries to use bcrypt (via pgcrypto extension)
--    If pgcrypto is not available, it falls back to MD5
--
-- 2. To enable pgcrypto extension in Supabase:
--    Run: CREATE EXTENSION IF NOT EXISTS pgcrypto;
--
-- 3. For best security, use the Node.js script:
--    npm run create-admin
--    This creates the user in Supabase Auth (most secure)
--
-- 4. Password hashing priority:
--    - Best: Supabase Auth (via Node.js script)
--    - Good: bcrypt (this script with pgcrypto)
--    - Basic: MD5 (fallback, less secure)
-- =====================================================================

