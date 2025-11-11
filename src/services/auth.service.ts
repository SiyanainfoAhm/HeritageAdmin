import { supabase } from '@/config/supabase';
import { User } from '@/types';
import bcrypt from 'bcryptjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Login with email and password
   * Supports both Supabase Auth and direct heritage_user table authentication
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User | null; error: Error | null }> {
    try {
      // First, try Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      // If Supabase Auth succeeds, get user from heritage_user table
      if (!authError && authData?.user) {
        const { data: userData, error: userError } = await supabase
          .from('heritage_user')
          .select('*')
          .eq('email', credentials.email.toLowerCase())
          .single();

        if (userError) {
          return { user: null, error: userError };
        }

        return { user: userData as User, error: null };
      }

      // If Supabase Auth fails, try direct heritage_user authentication (like mobile app)
      // This allows login with users created via SQL script
      const { data: userData, error: userError } = await supabase
        .from('heritage_user')
        .select('user_id, email, phone, password_hash, language_code, user_type_id, full_name, is_verified, created_at')
        .or(`email.ilike.${credentials.email.toLowerCase()},phone.eq.${credentials.email}`)
        .single();

      if (userError || !userData) {
        return { user: null, error: new Error('Invalid login credentials') };
      }

      // Verify password hash
      // Try bcrypt first (like mobile app), then MD5 (for SQL-created users)
      let isPasswordValid = false;
      
      if (userData.password_hash) {
        // Try bcrypt verification (like mobile app)
        try {
          isPasswordValid = await bcrypt.compare(credentials.password, userData.password_hash);
        } catch (e) {
          // If bcrypt fails, try MD5 (for SQL-created users)
          const md5Hash = await this.hashPasswordMD5(credentials.password, userData.email);
          isPasswordValid = md5Hash === userData.password_hash;
        }
      }
      
      if (!isPasswordValid) {
        return { user: null, error: new Error('Invalid login credentials') };
      }

      // Return user data (without password_hash)
      const { password_hash, ...userWithoutPassword } = userData;
      return { user: userWithoutPassword as User, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Hash password using MD5 (matches SQL script)
   * Note: This is for compatibility with SQL-created users
   * For production, use bcrypt or Supabase Auth
   */
  private static async hashPasswordMD5(password: string, email: string): Promise<string> {
    // Simple MD5 hash (matches SQL script: MD5(password || email))
    // Using md5 library for browser compatibility
    const md5 = (await import('md5')).default;
    return md5(password + email);
  }

  /**
   * Get current session
   */
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: userData } = await supabase
      .from('heritage_user')
      .select('*')
      .eq('email', user.email)
      .single();

    return userData as User | null;
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }
}

