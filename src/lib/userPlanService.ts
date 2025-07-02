import { supabase } from './supabase';

export interface UserPlan {
  id: string;
  email: string;
  plan_type: 'free' | 'gold' | 'diamond';
  updated_at: string;
}

export interface UpdatePlanRequest {
  userId: string;
  planType: 'gold' | 'diamond';
  userEmail?: string;
  paymentIntentId?: string;
}

export interface UpdatePlanResult {
  success: boolean;
  error?: string;
  user?: UserPlan;
}

/**
 * Updates a user's plan type in the database
 */
export async function updateUserPlan(request: UpdatePlanRequest): Promise<UpdatePlanResult> {
  try {
    const { userId, planType } = request;
    
    // Check if supabase client is available
    if (!supabase) {
      return {
        success: false,
        error: 'Database connection not available'
      };
    }
    
    // Validate input
    if (!userId || !planType) {
      return {
        success: false,
        error: 'User ID and plan type are required'
      };
    }

    if (!['gold', 'diamond'].includes(planType)) {
      return {
        success: false,
        error: 'Invalid plan type'
      };
    }

    // Update the user's plan in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        plan_type: planType,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      // If user profile doesn't exist, create one first
      if (error.code === 'PGRST116') {
        console.log('User profile not found during update, creating new profile...');
        const createResult = await createUserProfileIfNotExists(userId, request.userEmail);
        if (!createResult.success) {
          return createResult;
        }
        // Now try to update again
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            plan_type: planType,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select('*')
          .single();
        
        if (updateError) {
          console.error('Error updating user plan after creation:', updateError);
          return {
            success: false,
            error: updateError.message || 'Failed to update user plan'
          };
        }
        
        return {
          success: true,
          user: {
            id: updateData.id,
            email: updateData.email,
            plan_type: updateData.plan_type,
            updated_at: updateData.updated_at
          }
        };
      }
      
      console.error('Error updating user plan:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user plan'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    console.log('✅ User plan updated successfully:', data);

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        plan_type: data.plan_type,
        updated_at: data.updated_at
      }
    };

  } catch (error) {
    console.error('Unexpected error updating user plan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Creates a user profile if it doesn't exist
 */
async function createUserProfileIfNotExists(userId: string, email?: string): Promise<UpdatePlanResult> {
  if (!supabase) {
    return {
      success: false,
      error: 'Database connection not available'
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email || '',
        plan_type: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user profile'
      };
    }

    console.log('✅ User profile created:', data);

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        plan_type: data.plan_type || 'free',
        updated_at: data.updated_at
      }
    };

  } catch (error) {
    console.error('Unexpected error creating user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
export async function getUserPlan(userId: string, userEmail?: string): Promise<UpdatePlanResult> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    // Check if supabase client is available
    if (!supabase) {
      return {
        success: false,
        error: 'Database connection not available'
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, plan_type, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      // If user profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        console.log('User profile not found, creating new profile...');
        return await createUserProfileIfNotExists(userId, userEmail);
      }
      
      console.error('Error fetching user plan:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user plan'
      };
    }

    if (!data) {
      // Fallback: create profile if data is null
      console.log('User profile data is null, creating new profile...');
      return await createUserProfileIfNotExists(userId, userEmail);
    }

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        plan_type: data.plan_type || 'free',
        updated_at: data.updated_at
      }
    };

  } catch (error) {
    console.error('Unexpected error fetching user plan:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Gets the display name for a plan type
 */
export function getPlanDisplayName(planType: string): string {
  switch (planType) {
    case 'gold':
      return 'Gold Member';
    case 'diamond':
      return 'Diamond Member';
    case 'free':
    default:
      return 'Free Member';
  }
}
