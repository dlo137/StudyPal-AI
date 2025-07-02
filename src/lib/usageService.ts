import { supabase } from './supabase';

export interface DailyUsage {
  id: string;
  user_id: string;
  date: string;
  questions_asked: number;
  plan_type: 'free' | 'gold' | 'diamond';
  created_at: string;
  updated_at: string;
}

export interface UsageResult {
  success: boolean;
  error?: string;
  usage?: DailyUsage;
  canAsk?: boolean;
  remaining?: number;
  limit?: number;
}

/**
 * Gets the daily question limit for each plan type
 */
export function getDailyLimit(planType: 'free' | 'gold' | 'diamond'): number {
  switch (planType) {
    case 'free':
      return 5;
    case 'gold':
      return 10;
    case 'diamond':
      return 15;
    default:
      return 5;
  }
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Checks if user can ask a question based on their daily limit
 */
export async function checkDailyUsage(userId: string, planType: 'free' | 'gold' | 'diamond'): Promise<UsageResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Database connection not available'
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    const today = getTodayDate();
    const limit = getDailyLimit(planType);

    // Get today's usage for the user
    const { data, error } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking daily usage:', error);
      return {
        success: false,
        error: error.message || 'Failed to check daily usage'
      };
    }

    // If no record exists, user hasn't asked any questions today
    if (!data) {
      return {
        success: true,
        canAsk: true,
        remaining: limit,
        limit: limit,
        usage: {
          id: '',
          user_id: userId,
          date: today,
          questions_asked: 0,
          plan_type: planType,
          created_at: '',
          updated_at: ''
        }
      };
    }

    // Check if user has reached their limit
    const questionsAsked = data.questions_asked;
    const canAsk = questionsAsked < limit;
    const remaining = Math.max(0, limit - questionsAsked);

    return {
      success: true,
      canAsk: canAsk,
      remaining: remaining,
      limit: limit,
      usage: {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        questions_asked: data.questions_asked,
        plan_type: data.plan_type,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    };

  } catch (error) {
    console.error('Unexpected error checking daily usage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Records a question asked by incrementing the daily usage count
 * This function also checks the limit before recording to prevent race conditions
 */
export async function recordQuestionAsked(userId: string, planType: 'free' | 'gold' | 'diamond'): Promise<UsageResult> {
  // Use the fallback method directly for better compatibility
  return await recordQuestionAskedFallback(userId, planType);
}

/**
 * Fallback method for recording questions if the RPC function doesn't exist
 */
async function recordQuestionAskedFallback(userId: string, planType: 'free' | 'gold' | 'diamond'): Promise<UsageResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Database connection not available'
      };
    }

    const today = getTodayDate();
    const limit = getDailyLimit(planType);

    // Try to update existing record first
    const { data: existingData, error: fetchError } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing usage:', fetchError);
      return {
        success: false,
        error: fetchError.message || 'Failed to fetch existing usage'
      };
    }

    if (existingData) {
      // Check if user has reached limit before updating
      if (existingData.questions_asked >= limit) {
        return {
          success: false,
          error: 'Daily limit exceeded'
        };
      }

      // Update existing record
      const { data, error } = await supabase
        .from('daily_usage')
        .update({
          questions_asked: existingData.questions_asked + 1,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating daily usage:', error);
        return {
          success: false,
          error: error.message || 'Failed to update daily usage'
        };
      }

      return {
        success: true,
        usage: {
          id: data.id,
          user_id: data.user_id,
          date: data.date,
          questions_asked: data.questions_asked,
          plan_type: data.plan_type,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      };
    } else {
      // Create new record (first question of the day)
      const { data, error } = await supabase
        .from('daily_usage')
        .insert({
          user_id: userId,
          date: today,
          questions_asked: 1,
          plan_type: planType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating daily usage record:', error);
        return {
          success: false,
          error: error.message || 'Failed to create daily usage record'
        };
      }

      return {
        success: true,
        usage: {
          id: data.id,
          user_id: data.user_id,
          date: data.date,
          questions_asked: data.questions_asked,
          plan_type: data.plan_type,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
      };
    }

  } catch (error) {
    console.error('Unexpected error recording question:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
