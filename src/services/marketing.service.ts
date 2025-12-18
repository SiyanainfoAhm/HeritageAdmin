import { supabase } from '@/config/supabase';

export interface Campaign {
  id: number;
  name: string;
  description: string;
  audience: string;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  createdOn: string;
  createdBy: string;
}

interface CampaignDBRow {
  campaign_id?: number;
  name: string;
  description: string;
  audience: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at?: string;
  created_by?: string;
}

export class MarketingService {
  /**
   * Map database row to Campaign interface
   */
  private static mapDBRowToCampaign(row: any): Campaign {
    // Helper to convert date to YYYY-MM-DD format
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') {
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        // If it's a timestamp, extract date part
        return date.split('T')[0];
      }
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return '';
    };

    return {
      id: row.campaign_id || row.id,
      name: row.name || '',
      description: row.description || '',
      audience: row.audience || 'All Users',
      startDate: formatDate(row.start_date || row.startDate),
      endDate: formatDate(row.end_date || row.endDate),
      status: (row.status || 'Draft') as Campaign['status'],
      createdOn: formatDate(row.created_at || row.createdOn),
      createdBy: row.created_by || row.createdBy || 'System',
    };
  }

  /**
   * Map Campaign interface to database row
   */
  private static mapCampaignToDBRow(campaign: Partial<Campaign>): Partial<CampaignDBRow> {
    const dbRow: Partial<CampaignDBRow> = {};
    
    if (campaign.name !== undefined) dbRow.name = campaign.name;
    if (campaign.description !== undefined) dbRow.description = campaign.description;
    if (campaign.audience !== undefined) dbRow.audience = campaign.audience;
    if (campaign.startDate !== undefined) dbRow.start_date = campaign.startDate;
    if (campaign.endDate !== undefined) dbRow.end_date = campaign.endDate;
    if (campaign.status !== undefined) dbRow.status = campaign.status;
    if (campaign.createdBy !== undefined) dbRow.created_by = campaign.createdBy;
    
    return dbRow;
  }

  /**
   * Get all campaigns
   */
  static async getCampaigns(): Promise<Campaign[]> {
    try {
      const { data, error } = await supabase
        .from('heritage_marketing_campaign')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDBRowToCampaign(row));
    } catch (error) {
      console.error('Exception fetching campaigns:', error);
      return [];
    }
  }

  /**
   * Get a single campaign by ID
   */
  static async getCampaignById(campaignId: number): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('heritage_marketing_campaign')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) {
        console.error('Error fetching campaign:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return this.mapDBRowToCampaign(data);
    } catch (error) {
      console.error('Exception fetching campaign:', error);
      return null;
    }
  }

  /**
   * Create a new campaign
   */
  static async createCampaign(campaign: Omit<Campaign, 'id' | 'createdOn' | 'createdBy'>): Promise<{ success: boolean; data?: Campaign; error?: any }> {
    try {
      const dbRow = this.mapCampaignToDBRow({
        ...campaign,
        createdBy: campaign.createdBy || 'Current User',
      });

      const { data, error } = await supabase
        .from('heritage_marketing_campaign')
        .insert(dbRow)
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        return { success: false, error };
      }

      if (!data) {
        return { success: false, error: 'No data returned from insert' };
      }

      return { success: true, data: this.mapDBRowToCampaign(data) };
    } catch (error) {
      console.error('Exception creating campaign:', error);
      return { success: false, error };
    }
  }

  /**
   * Update an existing campaign
   */
  static async updateCampaign(
    campaignId: number,
    updates: Partial<Omit<Campaign, 'id' | 'createdOn' | 'createdBy'>>
  ): Promise<{ success: boolean; data?: Campaign; error?: any }> {
    try {
      const dbRow = this.mapCampaignToDBRow(updates);

      const { data, error } = await supabase
        .from('heritage_marketing_campaign')
        .update(dbRow)
        .eq('campaign_id', campaignId)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign:', error);
        return { success: false, error };
      }

      if (!data) {
        return { success: false, error: 'No data returned from update' };
      }

      return { success: true, data: this.mapDBRowToCampaign(data) };
    } catch (error) {
      console.error('Exception updating campaign:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a campaign
   */
  static async deleteCampaign(campaignId: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('heritage_marketing_campaign')
        .delete()
        .eq('campaign_id', campaignId);

      if (error) {
        console.error('Error deleting campaign:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception deleting campaign:', error);
      return { success: false, error };
    }
  }
}

export interface MailMessage {
  id: number;
  title: string;
  body: string;
  audience: string;
  date: string;
  status: 'Draft' | 'Scheduled' | 'Sent';
  type: 'Event' | 'Offer' | 'Announcement';
}

interface MailMessageDBRow {
  mail_id?: number;
  title: string;
  body: string;
  audience: string;
  date: string;
  status: string;
  type: string;
  created_at?: string;
  created_by?: string;
}

export class MailService {
  /**
   * Map database row to MailMessage interface
   */
  private static mapDBRowToMailMessage(row: any): MailMessage {
    // Helper to convert date to YYYY-MM-DD format
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') {
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        // If it's a timestamp, extract date part
        return date.split('T')[0];
      }
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return '';
    };

    return {
      id: row.mail_id || row.id,
      title: row.title || '',
      body: row.body || '',
      audience: row.audience || 'All Users',
      date: formatDate(row.date),
      status: (row.status || 'Draft') as MailMessage['status'],
      type: (row.type || 'Announcement') as MailMessage['type'],
    };
  }

  /**
   * Map MailMessage interface to database row
   */
  private static mapMailMessageToDBRow(message: Partial<MailMessage>): Partial<MailMessageDBRow> {
    const dbRow: Partial<MailMessageDBRow> = {};
    
    if (message.title !== undefined) dbRow.title = message.title;
    if (message.body !== undefined) dbRow.body = message.body;
    if (message.audience !== undefined) dbRow.audience = message.audience;
    if (message.date !== undefined) dbRow.date = message.date;
    if (message.status !== undefined) dbRow.status = message.status;
    if (message.type !== undefined) dbRow.type = message.type;
    if (message.createdBy !== undefined) dbRow.created_by = message.createdBy;
    
    return dbRow;
  }

  /**
   * Get all mail messages
   */
  static async getMailMessages(): Promise<MailMessage[]> {
    try {
      const { data, error } = await supabase
        .from('heritage_marketing_mail')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mail messages:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row) => this.mapDBRowToMailMessage(row));
    } catch (error) {
      console.error('Exception fetching mail messages:', error);
      return [];
    }
  }

  /**
   * Get a single mail message by ID
   */
  static async getMailMessageById(mailId: number): Promise<MailMessage | null> {
    try {
      const { data, error } = await supabase
        .from('heritage_marketing_mail')
        .select('*')
        .eq('mail_id', mailId)
        .single();

      if (error) {
        console.error('Error fetching mail message:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return this.mapDBRowToMailMessage(data);
    } catch (error) {
      console.error('Exception fetching mail message:', error);
      return null;
    }
  }

  /**
   * Create a new mail message
   */
  static async createMailMessage(
    message: Omit<MailMessage, 'id'>
  ): Promise<{ success: boolean; data?: MailMessage; error?: any }> {
    try {
      const dbRow: any = this.mapMailMessageToDBRow(message);
      dbRow.created_by = 'Current User';

      const { data, error } = await supabase
        .from('heritage_marketing_mail')
        .insert(dbRow)
        .select()
        .single();

      if (error) {
        console.error('Error creating mail message:', error);
        return { success: false, error };
      }

      if (!data) {
        return { success: false, error: 'No data returned from insert' };
      }

      return { success: true, data: this.mapDBRowToMailMessage(data) };
    } catch (error) {
      console.error('Exception creating mail message:', error);
      return { success: false, error };
    }
  }

  /**
   * Update an existing mail message
   */
  static async updateMailMessage(
    mailId: number,
    updates: Partial<Omit<MailMessage, 'id'>>
  ): Promise<{ success: boolean; data?: MailMessage; error?: any }> {
    try {
      const dbRow = this.mapMailMessageToDBRow(updates);

      const { data, error } = await supabase
        .from('heritage_marketing_mail')
        .update(dbRow)
        .eq('mail_id', mailId)
        .select()
        .single();

      if (error) {
        console.error('Error updating mail message:', error);
        return { success: false, error };
      }

      if (!data) {
        return { success: false, error: 'No data returned from update' };
      }

      return { success: true, data: this.mapDBRowToMailMessage(data) };
    } catch (error) {
      console.error('Exception updating mail message:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a mail message
   */
  static async deleteMailMessage(mailId: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('heritage_marketing_mail')
        .delete()
        .eq('mail_id', mailId);

      if (error) {
        console.error('Error deleting mail message:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception deleting mail message:', error);
      return { success: false, error };
    }
  }
}
