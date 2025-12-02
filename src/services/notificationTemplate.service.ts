import { supabase } from '@/config/supabase';
import { EmailService } from './email.service';

export interface EmailTemplate {
  id: number;
  template_key: string;
  template_name: string;
  email_subject: string;
  email_body_html: string;
  email_body_text?: string | null;
  sms_body?: string | null;
  whatsapp_body?: string | null;
  whatsapp_template_id?: string | null;
  push_title?: string | null;
  push_body?: string | null;
  push_image_url?: string | null;
  push_action_url?: string | null;
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
        .from('heritage_notification_templates')
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
        .from('heritage_notification_templates')
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
   * Get email template by template key
   */
  static async getEmailTemplateByKey(templateKey: string): Promise<EmailTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('heritage_notification_templates')
        .select('*')
        .eq('template_key', templateKey)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching email template by key:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching email template by key:', error);
      return null;
    }
  }

  /**
   * Replace template variables with actual values
   */
  static replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value || '');
    }
    return result;
  }

  /**
   * Send email notification using template
   */
  static async sendEmailNotification(
    userId: number,
    templateKey: string,
    recipientEmail: string,
    variables: Record<string, string> = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email
      if (!recipientEmail || !recipientEmail.trim()) {
        return { success: false, error: 'Recipient email is required' };
      }

      // Get the template
      const template = await this.getEmailTemplateByKey(templateKey);
      if (!template) {
        console.warn(`Email template not found: ${templateKey}. Email notification skipped.`);
        return { success: false, error: `Template not found: ${templateKey}` };
      }

      // Replace variables in subject and body
      const subject = this.replaceTemplateVariables(template.email_subject, variables);
      const bodyHtml = this.replaceTemplateVariables(template.email_body_html, variables);
      const bodyText = template.email_body_text
        ? this.replaceTemplateVariables(template.email_body_text, variables)
        : null;

      // Send email using SendGrid
      console.log(`📧 Sending email to: ${recipientEmail}`);
      const emailResult = await EmailService.sendEmailWithRetry({
        to: recipientEmail,
        subject: subject,
        html: bodyHtml,
        text: bodyText || undefined,
      });

      // Insert into notification log
      const logStatus = emailResult.success ? 'sent' : 'failed';
      const logData: any = {
        user_id: userId,
        notification_type: templateKey,
        channel: 'email',
        recipient: recipientEmail,
        subject: subject,
        content: bodyText || bodyHtml,
        template: templateKey,
        status: logStatus,
        provider: 'sendgrid',
        provider_message_id: emailResult.messageId || null,
        sent_at: emailResult.success ? new Date().toISOString() : null,
      };

      if (!emailResult.success) {
        logData.skip_reason = emailResult.error || 'Email send failed';
        logData.provider_response = { error: emailResult.error };
      }

      const { data: insertedLog, error: logError } = await supabase
        .from('heritage_notification_log')
        .insert(logData)
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creating notification log:', logError);
        // Don't fail if log insert fails, email might have been sent
      } else {
        console.log(`✅ Notification log created with ID: ${insertedLog?.id}`);
      }

      if (emailResult.success) {
        console.log(`✅ Email sent successfully! Message ID: ${emailResult.messageId || 'N/A'}`);
        return { success: true };
      } else {
        console.error(`❌ Email send failed: ${emailResult.error}`);
        return { success: false, error: emailResult.error };
      }
    } catch (error: any) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message || 'Failed to send email notification' };
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
        .from('heritage_notification_templates')
        .insert({
          template_key: template.template_key,
          template_name: template.template_name,
          email_subject: template.email_subject,
          email_body_html: template.email_body_html,
          email_body_text: template.email_body_text || null,
          sms_body: template.sms_body || null,
          whatsapp_body: template.whatsapp_body || null,
          whatsapp_template_id: template.whatsapp_template_id || null,
          push_title: template.push_title || null,
          push_body: template.push_body || null,
          push_image_url: template.push_image_url || null,
          push_action_url: template.push_action_url || null,
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
        .from('heritage_notification_templates')
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
        .from('heritage_notification_templates')
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

