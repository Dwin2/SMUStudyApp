import { APP_CONFIG } from '../constants';
import { useStore } from '../store/useStore';

/**
 * Sampling Service
 *
 * Manages the rules for when to show prompts:
 * - Max 15 prompts per day
 * - At least 1 hour between prompts
 * - Only during the user's active hours window
 */

export interface SamplingDecision {
  shouldShowPrompt: boolean;
  reason?: string;
}

/**
 * Check if the current time is within the user's active hours window
 */
export const isWithinActiveWindow = (
  windowStart: string,
  windowEnd: string
): boolean => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  // Handle midnight crossover
  if (windowEnd < windowStart) {
    // Window spans midnight (e.g., 08:00 to 00:00)
    return currentTime >= windowStart || currentTime <= windowEnd;
  }

  return currentTime >= windowStart && currentTime <= windowEnd;
};

/**
 * Check if enough time has passed since the last prompt
 */
export const hasEnoughTimePassed = (lastPromptTime: Date | null): boolean => {
  if (!lastPromptTime) return true;

  const now = new Date();
  const timeSinceLastPrompt = now.getTime() - lastPromptTime.getTime();
  const minInterval = APP_CONFIG.MIN_HOURS_BETWEEN_PROMPTS * 60 * 60 * 1000;

  return timeSinceLastPrompt >= minInterval;
};

/**
 * Check if the daily prompt limit has been reached
 */
export const isUnderDailyLimit = (promptsToday: number): boolean => {
  return promptsToday < APP_CONFIG.MAX_PROMPTS_PER_DAY;
};

/**
 * Main function to decide if a prompt should be shown
 */
export const shouldShowPrompt = (
  windowStart: string,
  windowEnd: string,
  promptsToday: number,
  lastPromptTime: Date | null
): SamplingDecision => {
  // Check daily limit
  if (!isUnderDailyLimit(promptsToday)) {
    return {
      shouldShowPrompt: false,
      reason: 'Daily prompt limit reached',
    };
  }

  // Check active window
  if (!isWithinActiveWindow(windowStart, windowEnd)) {
    return {
      shouldShowPrompt: false,
      reason: 'Outside active hours window',
    };
  }

  // Check time since last prompt
  if (!hasEnoughTimePassed(lastPromptTime)) {
    return {
      shouldShowPrompt: false,
      reason: 'Not enough time since last prompt',
    };
  }

  return {
    shouldShowPrompt: true,
  };
};

/**
 * Get the time until the next prompt can be shown
 */
export const getTimeUntilNextPrompt = (lastPromptTime: Date | null): number => {
  if (!lastPromptTime) return 0;

  const now = new Date();
  const minInterval = APP_CONFIG.MIN_HOURS_BETWEEN_PROMPTS * 60 * 60 * 1000;
  const timeSinceLastPrompt = now.getTime() - lastPromptTime.getTime();
  const timeRemaining = minInterval - timeSinceLastPrompt;

  return Math.max(0, timeRemaining);
};

/**
 * Format time remaining in a human-readable format
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) return 'Now';

  const minutes = Math.ceil(milliseconds / (1000 * 60));
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Check if it's a new day and reset daily counters if needed
 */
export const isNewDay = (lastPromptDate: Date | null): boolean => {
  if (!lastPromptDate) return false;

  const today = new Date();
  const lastDate = new Date(lastPromptDate);

  return today.toDateString() !== lastDate.toDateString();
};

/**
 * Get today's date as a string for tracking
 */
export const getTodayString = (): string => {
  return new Date().toDateString();
};
