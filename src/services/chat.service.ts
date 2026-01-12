import { supabase } from '@/config/supabase';

export interface ChatConversation {
  conversation_id: number;
  user_id: number;
  executive_id?: number;
  conversation_type: string;
  status: string;
  priority?: string;
  last_message_at?: string;
  last_message_text?: string;
  unread_count_user: number;
  unread_count_executive: number;
  created_at: string;
  updated_at?: string;
  closed_at?: string;
  // Joined user data
  user_name?: string;
  user_email?: string;
}

export interface ChatMessage {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: 'user' | 'executive' | 'system';
  sender_name?: string;
  message_text: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export class ChatService {
  /**
   * Get all conversations for admin (ordered by last_message_at)
   */
  static async getAllConversations(): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('heritage_chat_conversations')
        .select(`
          *,
          user:heritage_user!heritage_chat_conversations_user_id_fkey(user_id, full_name, email)
        `)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map((conv: any) => ({
        ...conv,
        user_name: conv.user?.full_name || 'Unknown User',
        user_email: conv.user?.email || '',
      }));
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      throw new Error(error.message || 'Failed to fetch conversations');
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: number): Promise<ChatConversation | null> {
    try {
      const { data, error } = await supabase
        .from('heritage_chat_conversations')
        .select(`
          *,
          user:heritage_user!heritage_chat_conversations_user_id_fkey(user_id, full_name, email)
        `)
        .eq('conversation_id', conversationId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) return null;

      return {
        ...data,
        user_name: data.user?.full_name || 'Unknown User',
        user_email: data.user?.email || '',
      };
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      throw new Error(error.message || 'Failed to fetch conversation');
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getConversationMessages(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      // Use direct query instead of RPC for better compatibility
      const { data, error } = await supabase
        .from('heritage_chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(error.message);
      }

      return (data || []) as ChatMessage[];
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      throw new Error(error.message || 'Failed to fetch messages');
    }
  }

  /**
   * Send a message as executive/admin
   */
  static async sendMessage(
    conversationId: number,
    senderId: number,
    messageText: string,
    messageType: string = 'text',
    attachmentUrl?: string
  ): Promise<ChatMessage> {
    try {
      // Get sender name
      const { data: userData } = await supabase
        .from('heritage_user')
        .select('full_name, email, phone')
        .eq('user_id', senderId)
        .single();

      const senderName = userData?.full_name || userData?.email || userData?.phone || 'Admin';

      // Insert message
      const { data, error } = await supabase
        .from('heritage_chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: 'executive',
          sender_name: senderName,
          message_text: messageText,
          message_type: messageType,
          attachment_url: attachmentUrl || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Failed to send message');
      }

      return data as ChatMessage;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(
    conversationId: number,
    userId: number
  ): Promise<number> {
    try {
      // Mark all user messages as read (admin is executive, so mark user messages)
      const { data, error, count } = await supabase
        .from('heritage_chat_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'user')
        .eq('is_read', false)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return data?.length || 0;
    } catch (error: any) {
      console.error('Error marking messages as read:', error);
      throw new Error(error.message || 'Failed to mark messages as read');
    }
  }

  /**
   * Create or get conversation
   */
  static async createOrGetConversation(
    userId: number,
    conversationType: string = 'executive'
  ): Promise<ChatConversation> {
    try {
      const { data, error } = await supabase.rpc('heritage_create_or_get_conversation', {
        p_user_id: userId,
        p_conversation_type: conversationType,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create or get conversation');
      }

      const conversation = data[0];
      return await this.getConversation(conversation.conversation_id);
    } catch (error: any) {
      console.error('Error creating/getting conversation:', error);
      throw new Error(error.message || 'Failed to create or get conversation');
    }
  }

  /**
   * Subscribe to new messages in a conversation
   */
  static subscribeToMessages(
    conversationId: number,
    callback: (message: ChatMessage) => void
  ) {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'heritage_chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Subscribe to conversation updates
   */
  static subscribeToConversations(callback: (conversation: ChatConversation) => void) {
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'heritage_chat_conversations',
        },
        async (payload) => {
          if (payload.new) {
            const conversation = await this.getConversation(
              (payload.new as any).conversation_id
            );
            if (conversation) {
              callback(conversation);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

