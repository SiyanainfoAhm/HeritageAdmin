# Create Admin User - Quick Guide

## Quick Start

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Create `.env` file** in the root directory:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   VITE_SUPABASE_URL=https://ecvqhfbiwqmqgiqfxheu.supabase.co
   ```
   
   **Note**: The `VITE_SUPABASE_URL` is already set from the mobile app configuration. You only need to add the `SUPABASE_SERVICE_ROLE_KEY`.

3. **Run the script**:
   ```bash
   npm run create-admin
   ```

4. **Follow the prompts** to enter admin user details.

## Getting Your Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (URL: `https://ecvqhfbiwqmqgiqfxheu.supabase.co`)
3. Go to **Settings** > **API**
4. Find the **service_role** key (under "Project API keys")
   - It will look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (much longer than the anon key)
5. Copy it to your `.env` file as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important**: 
- The service_role key has full database access. Keep it secret and never commit it to version control!
- The `.env` file is already in `.gitignore` for security
- The Supabase URL is already configured from the mobile app: `https://ecvqhfbiwqmqgiqfxheu.supabase.co`

## What Gets Created

- ✅ User in Supabase Authentication (if using Supabase Auth)
- ✅ Admin user type (if it doesn't exist)
- ✅ User record in `heritage_user` table
- ✅ User marked as verified
- ✅ Password stored securely

## Example Usage

```bash
$ npm run create-admin

=== Create Admin User ===

Enter full name: Admin User
Enter email: admin@heritage.com
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
   Name: Admin User
   Email: admin@heritage.com
   Phone: +1234567890
   User Type ID: 1
   Verified: Yes

🔐 You can now login with these credentials.
```

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY not found"
- Make sure you have a `.env` file in the root directory
- Add `SUPABASE_SERVICE_ROLE_KEY=your_key_here` to the file
- Restart the script

### "User already exists"
- The script will ask if you want to update the existing user
- Type 'y' to update or 'n' to cancel

### "Password too short"
- Password must be at least 6 characters long

### Database connection errors
- Check your Supabase URL
- Verify your service role key is correct
- Ensure your Supabase project is active

## Alternative: Manual Creation

If you prefer to create the admin user manually:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" and create a user
3. Go to Table Editor > `heritage_user`
4. Insert a new row with:
   - `full_name`: Admin name
   - `email`: Admin email
   - `user_type_id`: 1 (or create admin type first)
   - `is_verified`: true
   - `language_code`: 'EN'

