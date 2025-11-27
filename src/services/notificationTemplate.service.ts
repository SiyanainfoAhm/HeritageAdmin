import { supabase } from '@/config/supabase';

export interface EmailTemplate {
  id: number;
  template_key: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  is_critical: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: number;
  user_id: number;
  notification_type: string;
  channel: string;
  recipient: string;
  subject: string | null;
  content: string | null;
  template: string | null;
  status: string;
  skip_reason: string | null;
  provider: string | null;
  provider_message_id: string | null;
  provider_response: any;
  created_at: string;
  sent_at: string | null;
}

export class NotificationTemplateService {
  /**
   * Get all email templates
   */
  static async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('heritage_email_templates')
        .select('*')
        .order('template_name', { ascending: true });

      if (error) {
        console.error('Error fetching email templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching email templates:', error);
      return [];
    }
  }

  /**
   * Get email template by ID
   */
  static async getEmailTemplateById(id: number): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('heritage_email_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching email template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching email template:', error);
      return null;
    }
  }

  /**
   * Create email template
   */
  static async createEmailTemplate(
    template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; data?: EmailTemplate; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('heritage_email_templates')
        .insert({
          template_key: template.template_key,
          template_name: template.template_name,
          subject_template: template.subject_template,
          body_template: template.body_template,
          is_critical: template.is_critical,
          is_active: template.is_active,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Update email template
   */
  static async updateEmailTemplate(
    id: number,
    updates: Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ success: boolean; data?: EmailTemplate; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('heritage_email_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Delete email template
   */
  static async deleteEmailTemplate(id: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('heritage_email_templates')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Get notification logs with pagination
   */
  static async getNotificationLogs(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      notification_type?: string;
      channel?: string;
      status?: string;
    }
  ): Promise<{ data: NotificationLog[]; total: number }> {
    try {
      let query = supabase
        .from('heritage_notification_log')
        .select('*', { count: 'exact' });

      if (filters?.notification_type) {
        query = query.eq('notification_type', filters.notification_type);
      }
      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching notification logs:', error);
        return { data: [], total: 0 };
      }

      return { data: data || [], total: count || 0 };
    } catch (error) {
      console.error('Exception fetching notification logs:', error);
      return { data: [], total: 0 };
    }
  }
}

