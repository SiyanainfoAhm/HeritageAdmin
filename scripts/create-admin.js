import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables if .env exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Supabase Configuration (from mobile app: lib/config/database_config.dart)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '';

// Create Supabase client with service role key for admin operations
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Hash password (simple hash for demo - in production use bcrypt)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

async function createAdminUser() {
  console.log('\n=== Create Admin User ===\n');

  // Check if service key is available
  if (!supabase || !supabaseServiceKey) {
    console.error(
      '❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in environment variables.\n'
    );
    console.log(
      'Please create a .env file in the root directory with:\n'
    );
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
    console.log(
      'You can find your service role key in Supabase Dashboard > Settings > API\n'
    );
    process.exit(1);
  }

  try {
    // Get user input
    const fullName = await question('Enter full name: ');
    const email = await question('Enter email: ');
    const phone = await question('Enter phone (optional, press Enter to skip): ');
    const password = await question('Enter password: ');
    const confirmPassword = await question('Confirm password: ');

    // Validate input
    if (!fullName || !email || !password) {
      console.error('❌ Error: Full name, email, and password are required.');
      rl.close();
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Error: Passwords do not match.');
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters.');
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    console.log('\n📋 Checking if user already exists...');
    const { data: existingUser } = await supabase
      .from('heritage_user')
      .select('user_id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('⚠️  User with this email already exists.');
      const overwrite = await question('Do you want to update this user? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Operation cancelled.');
        rl.close();
        process.exit(0);
      }
    }

    // Get or create admin user type
    console.log('\n📋 Checking admin user type...');
    let adminUserTypeId = null;

    // Try to find admin user type
    const { data: userTypes } = await supabase
      .from('Heritage_UserType')
      .select('user_type_id, type_key')
      .eq('type_key', 'admin')
      .single();

    if (userTypes) {
      adminUserTypeId = userTypes.user_type_id;
      console.log(`✅ Found admin user type (ID: ${adminUserTypeId})`);
    } else {
      // Create admin user type if it doesn't exist
      console.log('📋 Creating admin user type...');
      const { data: newUserType, error: userTypeError } = await supabase
        .from('Heritage_UserType')
        .insert({
          type_key: 'admin',
          display_order: 0,
          is_active: true,
          requires_verification: false,
          max_listings: 0,
          icon_name: 'admin_panel_settings',
          color_code: '#F44336',
        })
        .select('user_type_id')
        .single();

      if (userTypeError) {
        console.error('❌ Error creating admin user type:', userTypeError.message);
        // Try to use user_type_id = 1 as fallback
        adminUserTypeId = 1;
        console.log('⚠️  Using fallback user_type_id = 1');
      } else {
        adminUserTypeId = newUserType.user_type_id;
        console.log(`✅ Created admin user type (ID: ${adminUserTypeId})`);

        // Add translation
        await supabase.from('Heritage_UserTypeTranslation').insert({
          user_type_id: adminUserTypeId,
          language_code: 'EN',
          type_name: 'Administrator',
          type_description: 'System administrator with full access',
        });
      }
    }

    // Create user in Supabase Auth
    console.log('\n📋 Creating user in Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      rl.close();
      process.exit(1);
    }

    console.log('✅ User created in Supabase Auth');

    // Hash password for heritage_user table (if using password_hash column)
    const passwordHash = hashPassword(password);

    // Create or update user in heritage_user table
    console.log('\n📋 Creating user in heritage_user table...');
    const userData = {
      full_name: fullName,
      email: email,
      phone: phone || null,
      user_type_id: adminUserTypeId,
      is_verified: true,
      language_code: 'EN',
      password_hash: passwordHash, // Store hashed password
    };

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('heritage_user')
        .update(userData)
        .eq('user_id', existingUser.user_id);

      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        rl.close();
        process.exit(1);
      }
      console.log('✅ User updated in heritage_user table');
    } else {
      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('heritage_user')
        .insert(userData)
        .select('user_id')
        .single();

      if (insertError) {
        console.error('❌ Error creating user:', insertError.message);
        rl.close();
        process.exit(1);
      }
      console.log('✅ User created in heritage_user table');
    }

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   Name: ${fullName}`);
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phone || 'N/A'}`);
    console.log(`   User Type ID: ${adminUserTypeId}`);
    console.log(`   Verified: Yes\n`);
    console.log('🔐 You can now login with these credentials.\n');
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Run the script
createAdminUser();

