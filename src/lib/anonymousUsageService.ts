/**
 * Service for tracking daily usage for anonymous (non-authenticated) users
 * Uses localStorage to persist usage data
 */

export interface AnonymousUsage {
  date: string;
  questionsAsked: number;
  limit: number;
  remaining: number;
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Gets the localStorage key for anonymous usage
 */
function getStorageKey(): string {
  return 'studypal_anonymous_usage';
}

/**
 * Gets today's usage for anonymous user from localStorage
 */
export function getAnonymousUsage(): AnonymousUsage {
  const today = getTodayDate();
  const limit = 5; // Free plan limit
  
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) {
      return {
        date: today,
        questionsAsked: 0,
        limit,
        remaining: limit
      };
    }

    const usage = JSON.parse(stored);
    
    // If it's a new day, reset the usage
    if (usage.date !== today) {
      const newUsage = {
        date: today,
        questionsAsked: 0,
        limit,
        remaining: limit
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(newUsage));
      return newUsage;
    }

    // Return existing usage with correct remaining count
    return {
      date: usage.date,
      questionsAsked: usage.questionsAsked || 0,
      limit,
      remaining: Math.max(0, limit - (usage.questionsAsked || 0))
    };

  } catch (error) {
    console.error('Error reading anonymous usage from localStorage:', error);
    // Return fresh usage on error
    return {
      date: today,
      questionsAsked: 0,
      limit,
      remaining: limit
    };
  }
}

/**
 * Checks if anonymous user can ask another question
 */
export function canAskQuestion(): boolean {
  const usage = getAnonymousUsage();
  return usage.remaining > 0;
}

/**
 * Records a question asked by anonymous user
 */
export function recordAnonymousQuestion(): AnonymousUsage {
  const currentUsage = getAnonymousUsage();
  
  if (currentUsage.remaining <= 0) {
    throw new Error('Daily limit exceeded');
  }

  const newUsage: AnonymousUsage = {
    date: currentUsage.date,
    questionsAsked: currentUsage.questionsAsked + 1,
    limit: currentUsage.limit,
    remaining: Math.max(0, currentUsage.remaining - 1)
  };

  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(newUsage));
    return newUsage;
  } catch (error) {
    console.error('Error saving anonymous usage to localStorage:', error);
    throw new Error('Failed to record question');
  }
}

/**
 * Clears anonymous usage data (useful for testing or manual reset)
 */
export function clearAnonymousUsage(): void {
  try {
    localStorage.removeItem(getStorageKey());
  } catch (error) {
    console.error('Error clearing anonymous usage:', error);
  }
}
