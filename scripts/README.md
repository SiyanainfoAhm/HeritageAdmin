# Admin User Creation Script

This script helps you create an admin user for the Heritage Admin Dashboard.

## Prerequisites

1. **Supabase Service Role Key**: You need the service role key from your Supabase project to create users.
   - Go to Supabase Dashboard > Settings > API
   - Copy the `service_role` key (NOT the anon key)
   - ⚠️ **Keep this key secret!** Never commit it to version control.

2. **Environment Variables**: Create a `.env` file in the root directory with:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   VITE_SUPABASE_URL=https://ecvqhfbiwqmqgiqfxheu.supabase.co
   ```
   
   **Note**: The `VITE_SUPABASE_URL` is already configured from the mobile app (`lib/config/database_config.dart`). You only need to add the `SUPABASE_SERVICE_ROLE_KEY` which you can get from Supabase Dashboard > Settings > API > service_role key.

## Usage

### Option 1: Using npm script (Recommended)

```bash
npm run create-admin
```

### Option 2: Direct execution

```bash
node scripts/create-admin.js
```

## What the Script Does

1. **Checks for Admin User Type**: 
   - Looks for an existing "admin" user type in the database
   - Creates one if it doesn't exist

2. **Creates Supabase Auth User**:
   - Creates a user in Supabase Authentication
   - Auto-confirms the email

3. **Creates Heritage User Record**:
   - Creates a record in the `heritage_user` table
   - Sets user type to admin
   - Marks user as verified
   - Stores password hash

4. **Updates Existing Users**:
   - If a user with the email already exists, asks if you want to update it

## Example Output

```
=== Create Admin User ===

Enter full name: John Doe
Enter email: admin@example.com
Enter phone (optional, press Enter to skip): +1234567890
Enter password: ********
Confirm password: ********

📋 Checking if user already exists...
📋 Checking admin user type...
✅ Found admin user type (ID: 1)

📋 Creating user in Supabase Auth...
✅ User created in Supabase Auth

📋 Creating user in heritage_user table...
✅ User created in heritage_user table

✅ Admin user created successfully!

📋 User Details:
   Name: John Doe
   Email: admin@example.com
   Phone: +1234567890
   User Type ID: 1
   Verified: Yes

🔐 You can now login with these credentials.
```

## Security Notes

- ⚠️ The service role key has full access to your database. Keep it secure.
- ⚠️ Never commit the `.env` file to version control.
- ✅ The script uses the service role key only for admin operations.
- ✅ Passwords are hashed before storage.

## Troubleshooting

### Error: SUPABASE_SERVICE_ROLE_KEY not found
- Make sure you have a `.env` file in the root directory
- Add `SUPABASE_SERVICE_ROLE_KEY=your_key_here` to the file

### Error: User already exists
- The script will ask if you want to update the existing user
- Type 'y' to update or 'n' to cancel

### Error: Password too short
- Password must be at least 6 characters long

### Error: Database connection failed
- Check your Supabase URL and service role key
- Ensure your Supabase project is active
- Check your internet connection

