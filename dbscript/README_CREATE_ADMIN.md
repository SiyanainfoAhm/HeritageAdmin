# Create Admin User - SQL Script Guide

## Quick Start

1. **Open Supabase SQL Editor**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **SQL Editor**
   - Click **New Query**

2. **Edit the SQL Script**:
   - Open `dbscript/create_admin_user.sql`
   - Find the section marked `STEP 2: CREATE ADMIN USER`
   - Replace these values:
     ```sql
     admin_name TEXT := 'Admin User';           -- Your admin name
     admin_email TEXT := 'admin@heritage.com';   -- Your admin email
     admin_phone TEXT := NULL;                  -- Your admin phone (or NULL)
     admin_password TEXT := 'Admin@123';        -- Your admin password
     ```

3. **Run the Script**:
   - Copy the entire script
   - Paste it into Supabase SQL Editor
   - Click **Run** or press `Ctrl+Enter`

4. **Verify**:
   - Check the output at the bottom
   - You should see your admin user details

## What the Script Does

### Step 1: Creates Admin User Type
- Checks if 'admin' user type exists
- Creates it if it doesn't exist
- Adds translations (English, Hindi, Gujarati)

### Step 2: Creates Admin User
- Creates user in `heritage_user` table
- Sets user type to 'admin'
- Marks user as verified
- Hashes password (MD5 - simple hash)
- Creates user profile entry

### Step 3: Displays Results
- Shows created admin user information
- Displays user type details

## Example Output

```
NOTICE:  Created admin user type with ID: 1
NOTICE:  Added translations for admin user type
NOTICE:  Created admin user with ID: 123
NOTICE:  Created/updated user profile

 user_id | full_name  |      email       | phone | user_type_id | user_type | user_type_name | is_verified | language_code |         created_at
---------+------------+------------------+-------+--------------+-----------+----------------+-------------+---------------+----------------------------
     123 | Admin User | admin@heritage.com| NULL  |            1 | admin     | Administrator  | t          | EN            | 2025-01-27 10:30:00+00
```

## Important Notes

### Password Hashing
- The script uses **MD5** for password hashing (simple hash)
- This is for **development/testing** only
- For **production**, use:
  - Supabase Authentication (recommended)
  - OR bcrypt hashing
  - OR the Node.js script: `npm run create-admin`

### Supabase Authentication
If you want to use Supabase Auth (recommended):

1. **Option A: Use Node.js Script** (Recommended)
   ```bash
   npm run create-admin
   ```
   This creates the user in both Supabase Auth and heritage_user table.

2. **Option B: Manual Creation**
   - Go to Supabase Dashboard > Authentication > Users
   - Click "Add User"
   - Enter email and password
   - The SQL script will create the heritage_user record
   - Link them by matching email addresses

### Updating Existing User
- If a user with the email already exists, the script will **update** it
- It will change the user type to 'admin' and mark as verified
- Password will be updated

## Troubleshooting

### Error: "Admin user type not found"
- Make sure you run the entire script from the beginning
- The script creates the admin user type in Step 1

### Error: "relation heritage_user does not exist"
- Check table name: it should be `heritage_user` (lowercase)
- If your table is `Heritage_User` (uppercase), update the script

### Error: "duplicate key value violates unique constraint"
- User with this email already exists
- The script will update the existing user automatically

### Password Not Working
- The script uses MD5 hashing
- Your app might use a different hashing method
- Consider using Supabase Auth or the Node.js script

## Security Recommendations

1. **Use Strong Passwords**:
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `Admin@Heritage2024!`

2. **Use Supabase Auth**:
   - More secure than password_hash
   - Built-in password reset
   - Email verification
   - Session management

3. **Change Default Values**:
   - Never use default email/password
   - Always customize before running

## Alternative: Node.js Script

If you prefer a more automated approach:

```bash
# Install dependencies
npm install

# Create .env file with service role key
echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" > .env

# Run the script
npm run create-admin
```

The Node.js script:
- ✅ Creates user in Supabase Auth
- ✅ Creates user in heritage_user table
- ✅ Uses proper password hashing
- ✅ Interactive prompts
- ✅ Better error handling

## Next Steps

After creating the admin user:

1. **Test Login**:
   - Go to your web app: `http://localhost:3000`
   - Login with the admin credentials
   - Verify you can access the dashboard

2. **Create Additional Admins**:
   - Run the script again with different email
   - Or use the Node.js script

3. **Set Up Permissions**:
   - Configure role-based access if needed
   - Set up admin-only features

## Support

If you encounter issues:
1. Check Supabase Dashboard > Logs for errors
2. Verify table names match your schema
3. Check user type exists in Heritage_UserType table
4. Try the Node.js script as an alternative

