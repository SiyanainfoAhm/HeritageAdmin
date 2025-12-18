import { supabase } from '@/config/supabase';
import { EmailService } from './email.service';
import { FCMService } from './fcm.service';

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
   * Send FCM push notification using template
   * Upserts notification log (updates if exists, inserts if new)
   */
  static async sendPushNotification(
    userId: number,
    templateKey: string,
    deviceToken: string,
    variables: Record<string, string> = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const stripHtml = (html: string): string =>
        html
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

      // Validate device token
      if (!deviceToken || !deviceToken.trim()) {
        return { success: false, error: 'FCM device token is required' };
      }

      // Get the template
      const template = await this.getEmailTemplateByKey(templateKey);
      if (!template) {
        console.warn(`Template not found: ${templateKey}. Push notification skipped.`);
        await supabase.from('heritage_notification_log').insert({
          user_id: userId,
          notification_type: templateKey,
          channel: 'push',
          recipient: deviceToken,
          status: 'failed',
          skip_reason: `Template not found: ${templateKey}`,
          provider: 'fcm_v1',
          created_at: new Date().toISOString(),
        });
        return { success: false, error: `Template not found: ${templateKey}` };
      }

      // Fallback: use push fields if present, else reuse email subject/body
      const pushTitle =
        (template.push_title && this.replaceTemplateVariables(template.push_title, variables)) ||
        (template.email_subject && this.replaceTemplateVariables(template.email_subject, variables)) ||
        template.template_name ||
        templateKey;

      const pushBody =
        (template.push_body && this.replaceTemplateVariables(template.push_body, variables)) ||
        (template.email_body_text && this.replaceTemplateVariables(template.email_body_text, variables)) ||
        (template.email_body_html && stripHtml(this.replaceTemplateVariables(template.email_body_html, variables))) ||
        '';

      // Replace variables in title and body
      const title = pushTitle;
      const body = pushBody;
      const imageUrl = template.push_image_url
        ? this.replaceTemplateVariables(template.push_image_url, variables)
        : undefined;
      const clickAction = template.push_action_url
        ? this.replaceTemplateVariables(template.push_action_url, variables)
        : undefined;

      // Prepare data payload (optional additional data)
      const data: Record<string, string> = {
        notification_type: templateKey,
        user_id: userId.toString(),
        ...variables,
      };

      // Send push notification using FCM
      console.log(`📱 Sending push notification to device: ${deviceToken.substring(0, 20)}...`);
      const fcmResult = await FCMService.sendPushNotificationWithRetry({
        token: deviceToken,
        title: title,
        body: body,
        imageUrl: imageUrl,
        data: data,
        clickAction: clickAction,
      });

      // Upsert notification log
      const logStatus = fcmResult.success ? 'sent' : 'failed';
      const logData: any = {
        user_id: userId,
        notification_type: templateKey,
        channel: 'push',
        recipient: deviceToken,
        subject: title,
        content: body,
        template: templateKey,
        status: logStatus,
        provider: 'fcm_v1',
        provider_message_id: fcmResult.messageId || null,
        sent_at: fcmResult.success ? new Date().toISOString() : null,
      };

      if (!fcmResult.success) {
        logData.skip_reason = fcmResult.error || 'Push notification send failed';
        logData.provider_response = { error: fcmResult.error };
      }

      // Check if notification log already exists (upsert logic)
      const { data: existingLog, error: checkError } = await supabase
        .from('heritage_notification_log')
        .select('id')
        .eq('user_id', userId)
        .eq('notification_type', templateKey)
        .eq('channel', 'fcm')
        .eq('recipient', deviceToken)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is fine, ignore other errors
        console.error('❌ Error checking existing notification log:', checkError);
      }

      let logResult;
      if (existingLog && existingLog.id) {
        // Update existing log
        const { data: updatedLog, error: updateError } = await supabase
          .from('heritage_notification_log')
          .update({
            ...logData,
            // Don't update created_at on update
          })
          .eq('id', existingLog.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating notification log:', updateError);
          // Don't fail if log update fails, notification might have been sent
        } else {
          console.log(`✅ Notification log updated with ID: ${updatedLog?.id}`);
          logResult = updatedLog;
        }
      } else {
        // Insert new log
        const { data: insertedLog, error: insertError } = await supabase
          .from('heritage_notification_log')
          .insert(logData)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error creating notification log:', insertError);
          // Don't fail if log insert fails, notification might have been sent
        } else {
          console.log(`✅ Notification log created with ID: ${insertedLog?.id}`);
          logResult = insertedLog;
        }
      }

      if (fcmResult.success) {
        console.log(`✅ Push notification sent successfully! Message ID: ${fcmResult.messageId || 'N/A'}`);
        return { success: true };
      } else {
        console.error(`❌ Push notification send failed: ${fcmResult.error}`);
        return { success: false, error: fcmResult.error };
      }
    } catch (error: any) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message || 'Failed to send push notification' };
    }
  }

  /**
   * Upsert notification log (insert or update)
   * This is a helper method for direct notification log management
   */
  static async upsertNotificationLog(
    logData: Omit<NotificationLog, 'id' | 'created_at'>
  ): Promise<{ success: boolean; data?: NotificationLog; error?: any }> {
    try {
      // Check if notification log already exists
      const { data: existingLog, error: checkError } = await supabase
        .from('heritage_notification_log')
        .select('id')
        .eq('user_id', logData.user_id)
        .eq('notification_type', logData.notification_type)
        .eq('channel', logData.channel)
        .eq('recipient', logData.recipient)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking existing notification log:', checkError);
        return { success: false, error: checkError };
      }

      if (existingLog && existingLog.id) {
        // Update existing log
        const { data: updatedLog, error: updateError } = await supabase
          .from('heritage_notification_log')
          .update({
            ...logData,
          })
          .eq('id', existingLog.id)
          .select()
          .single();

        if (updateError) {
          return { success: false, error: updateError };
        }

        return { success: true, data: updatedLog };
      } else {
        // Insert new log
        const { data: insertedLog, error: insertError } = await supabase
          .from('heritage_notification_log')
          .insert(logData)
          .select()
          .single();

        if (insertError) {
          return { success: false, error: insertError };
        }

        return { success: true, data: insertedLog };
      }
    } catch (error) {
      console.error('Exception upserting notification log:', error);
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

