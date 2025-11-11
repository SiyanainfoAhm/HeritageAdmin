-- =====================================================================
-- CREATE ADMIN USER - SQL SCRIPT
-- =====================================================================
-- This script creates an admin user type (if it doesn't exist) and
-- creates an admin user in the heritage_user table.
--
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Replace the placeholder values below with your admin details:
--    - admin_name: Full name of the admin
--    - admin_email: Email address for the admin
--    - admin_phone: Phone number (optional, can be NULL)
--    - admin_password: Password (will be hashed)
-- 3. Run this script
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

        -- Add English translation
        INSERT INTO Heritage_UserTypeTranslation (
            user_type_id,
            language_code,
            type_name,
            type_description
        ) VALUES (
            admin_user_type_id,
            'EN',
            'Administrator',
            'System administrator with full access'
        );

        -- Add Hindi translation
        INSERT INTO Heritage_UserTypeTranslation (
            user_type_id,
            language_code,
            type_name,
            type_description
        ) VALUES (
            admin_user_type_id,
            'HI',
            'प्रशासक',
            'पूर्ण पहुंच के साथ सिस्टम प्रशासक'
        );

        -- Add Gujarati translation
        INSERT INTO Heritage_UserTypeTranslation (
            user_type_id,
            language_code,
            type_name,
            type_description
        ) VALUES (
            admin_user_type_id,
            'GU',
            'એડમિનિસ્ટ્રેટર',
            'સંપૂર્ણ ઍક્સેસ સાથે સિસ્ટમ એડમિનિસ્ટ્રેટર'
        );

        RAISE NOTICE 'Added translations for admin user type';
    ELSE
        RAISE NOTICE 'Admin user type already exists with ID: %', admin_user_type_id;
    END IF;
END $$;

-- =====================================================================
-- STEP 2: CREATE ADMIN USER
-- =====================================================================
-- IMPORTANT: Replace the values below with your admin details
-- =====================================================================

DO $$
DECLARE
    admin_user_type_id BIGINT;
    admin_user_id BIGINT;
    password_hash_value TEXT;
    admin_name TEXT := 'Admin User';           -- CHANGE THIS: Admin full name
    admin_email TEXT := 'admin@heritage.com'; -- CHANGE THIS: Admin email
    admin_phone TEXT := NULL;                 -- CHANGE THIS: Admin phone (or NULL)
    admin_password TEXT := 'Admin@123';       -- CHANGE THIS: Admin password
    existing_user_id BIGINT;
BEGIN
    -- Get admin user type ID
    SELECT user_type_id INTO admin_user_type_id
    FROM Heritage_UserType
    WHERE type_key = 'admin'
    LIMIT 1;

    IF admin_user_type_id IS NULL THEN
        RAISE EXCEPTION 'Admin user type not found. Please run the script from the beginning.';
    END IF;

    -- Check if user already exists (try both table name cases)
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

    IF existing_user_id IS NOT NULL THEN
        RAISE NOTICE 'User with email % already exists (ID: %). Updating user...', admin_email, existing_user_id;
        
        -- Simple password hash (for demo - in production use bcrypt)
        -- This is a basic hash function - replace with proper bcrypt if needed
        password_hash_value := MD5(admin_password || admin_email);
        
        -- Update existing user (try both table name cases)
        BEGIN
            -- Try with updated_at first (if column exists)
            BEGIN
                UPDATE heritage_user
                SET
                    full_name = admin_name,
                    phone = admin_phone,
                    user_type_id = admin_user_type_id,
                    is_verified = TRUE,
                    language_code = 'EN',
                    password_hash = password_hash_value,
                    updated_at = NOW()
                WHERE user_id = existing_user_id;
            EXCEPTION
                WHEN undefined_column THEN
                    -- Column doesn't exist, update without updated_at
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
                BEGIN
                    UPDATE Heritage_User
                    SET
                        full_name = admin_name,
                        phone = admin_phone,
                        user_type_id = admin_user_type_id,
                        is_verified = TRUE,
                        language_code = 'EN',
                        password_hash = password_hash_value,
                        updated_at = NOW()
                    WHERE user_id = existing_user_id;
                EXCEPTION
                    WHEN undefined_column THEN
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
        END;

        RAISE NOTICE 'Updated existing user with ID: %', existing_user_id;
    ELSE
        -- Simple password hash (for demo - in production use bcrypt)
        -- This is a basic hash function - replace with proper bcrypt if needed
        password_hash_value := MD5(admin_password || admin_email);

        -- Insert new admin user (try both table name cases)
        BEGIN
            -- Try with updated_at first (if column exists)
            BEGIN
                INSERT INTO heritage_user (
                    full_name,
                    email,
                    phone,
                    user_type_id,
                    is_verified,
                    language_code,
                    password_hash,
                    created_at,
                    updated_at
                ) VALUES (
                    admin_name,
                    LOWER(admin_email),
                    admin_phone,
                    admin_user_type_id,
                    TRUE,
                    'EN',
                    password_hash_value,
                    NOW(),
                    NOW()
                )
                RETURNING user_id INTO admin_user_id;
            EXCEPTION
                WHEN undefined_column THEN
                    -- Column doesn't exist, insert without updated_at
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
                BEGIN
                    INSERT INTO Heritage_User (
                        full_name,
                        email,
                        phone,
                        user_type_id,
                        is_verified,
                        language_code,
                        password_hash,
                        created_at,
                        updated_at
                    ) VALUES (
                        admin_name,
                        LOWER(admin_email),
                        admin_phone,
                        admin_user_type_id,
                        TRUE,
                        'EN',
                        password_hash_value,
                        NOW(),
                        NOW()
                    )
                    RETURNING user_id INTO admin_user_id;
                EXCEPTION
                    WHEN undefined_column THEN
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
            COALESCE(existing_user_id, admin_user_id),
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

-- Display created admin user
-- Note: If you get an error about table name, try changing 'heritage_user' to 'Heritage_User' (or vice versa)
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
-- 1. This script creates a user in the heritage_user table only.
--    To use Supabase Authentication, you need to create the user
--    separately in Supabase Dashboard > Authentication > Users
--    OR use the Node.js script: npm run create-admin
--
-- 2. Password hashing: This script uses MD5 for simplicity.
--    For production, consider using bcrypt or Supabase Auth.
--
-- 3. After running this script:
--    - The admin user will be created in heritage_user table
--    - User will be marked as verified
--    - User type will be set to 'admin'
--    - You can login using the email and password you specified
--
-- 4. If you want to use Supabase Auth, create the user in:
--    Supabase Dashboard > Authentication > Users > Add User
--    Then link it to the heritage_user record by matching email
-- =====================================================================

