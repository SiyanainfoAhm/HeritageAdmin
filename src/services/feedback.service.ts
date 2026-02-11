import { supabase } from '@/config/supabase';
import { UserService } from '@/services/user.service';

export type FeedbackCategory = 'uiux' | 'bug' | 'performance' | 'other';
export type FeedbackStatus = 'Open' | 'In Progress' | 'Resolved';

/** Display labels for category column and filter chips (DB stores lowercase). */
export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  uiux: 'UI/UX',
  bug: 'Bug Report',
  performance: 'Performance',
  other: 'Other',
};

export interface FeedbackItem {
  feedback_id: number;
  user_id: number;
  user_name: string;
  user_type_name: string; // Entity: Tourist, Artisan, Food Vendor, Hotel Owner, etc.
  type: FeedbackCategory;
  comments: string;
  status: FeedbackStatus;
  created_at: string;
}

export interface FeedbackFilters {
  type?: FeedbackCategory;
  status?: FeedbackStatus;
  page?: number;
  limit?: number;
}

export interface FeedbackListResponse {
  data: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const FEEDBACK_TABLE = 'heritage_app_feedback';
const DEFAULT_STATUS: FeedbackStatus = 'Open';

const VALID_CATEGORIES: FeedbackCategory[] = ['uiux', 'bug', 'performance', 'other'];

function toFeedbackCategory(value: unknown): FeedbackCategory {
  const s = typeof value === 'string' ? value.toLowerCase().trim() : '';
  return (VALID_CATEGORIES.includes(s as FeedbackCategory) ? s : 'other') as FeedbackCategory;
}

export class FeedbackService {
  /**
   * Get all feedback/complaints from the database with user type as Entity.
   * Status defaults to Open; other values: In Progress, Resolved.
   * Description column shows comments from the database.
   */
  static async getFeedbackList(filters?: FeedbackFilters): Promise<FeedbackListResponse> {
    try {
      const page = filters?.page ?? 1;
      const limit = Math.min(filters?.limit ?? 10, 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from(FEEDBACK_TABLE)
        .select(
          'id, user_id, category, comment, status, created_at, user:heritage_user!heritage_app_feedback_user_id_fkey(full_name, user_type_id)',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to);

      if (filters?.type) {
        query = query.eq('category', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data: rows, error, count } = await query;

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Feedback table not found. Run dbscript/create_feedback_table.sql to create it.');
          return { data: [], total: 0, page, limit, totalPages: 0 };
        }
        throw new Error(error.message);
      }

      const userTypes = await UserService.getUserTypes();
      const typeNameById = new Map(userTypes.map((t) => [t.user_type_id, t.type_name]));

      const data: FeedbackItem[] = (rows || []).map((row: any) => {
        const user = row.user;
        const userTypeName = user?.user_type_id != null ? typeNameById.get(user.user_type_id) ?? `Type ${user.user_type_id}` : '—';
        return {
          feedback_id: row.id,
          user_id: row.user_id,
          user_name: user?.full_name ?? '—',
          user_type_name: userTypeName,
          type: toFeedbackCategory(row.category),
          comments: row.comment ?? '',
          status: (row.status || DEFAULT_STATUS) as FeedbackStatus,
          created_at: row.created_at ?? new Date().toISOString(),
        };
      });

      const total = count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { data, total, page, limit, totalPages };
    } catch (err: any) {
      console.error('Error fetching feedback:', err);
      throw new Error(err?.message ?? 'Failed to fetch feedback');
    }
  }

  /**
   * Update feedback status (Open | In Progress | Resolved).
   */
  static async updateStatus(
    feedbackId: number,
    status: FeedbackStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from(FEEDBACK_TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', feedbackId);

      if (error) throw new Error(error.message);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to update status' };
    }
  }
}
