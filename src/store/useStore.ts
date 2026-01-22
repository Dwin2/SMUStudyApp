import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  StudyPhase,
  AppSession,
  SamplingState,
  StudyGroup,
} from '../types';
import { APP_CONFIG, SOCIAL_MEDIA_APPS } from '../constants';
import {
  createUser,
  getUser,
  updateUser,
  updateUserPhase,
  updateUserSettings,
  saveResponse,
  saveAppEvent,
  getTodayResponseCount,
  generateParticipantId,
  randomlyAssignGroup,
  signInAnonymousUser,
} from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // Auth State
  isAuthenticated: boolean;
  userId: string | null;

  // User Data
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Sampling State
  sampling: SamplingState;

  // UI State
  currentPromptPlatform: string | null;
  currentSessionId: string | null;

  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  updatePhase: (phase: StudyPhase) => Promise<void>;
  updateSettings: (settings: Partial<User['settings']>) => Promise<void>;

  // Session Actions
  startAppSession: (platform: string) => string;
  endAppSession: (sessionId: string) => void;
  getActiveSession: (platform: string) => AppSession | undefined;

  // Sampling Actions
  canShowPrompt: () => boolean;
  recordPromptShown: () => void;
  resetDailySampling: () => void;

  // Response Actions
  saveMRPResponse: (platform: string, sessionId: string, response: string) => Promise<void>;
  saveNPResponse: (platform: string, sessionId: string, question: string, response: string) => Promise<void>;
  saveSatisfactionResponse: (platform: string, sessionId: string, satisfaction: string) => Promise<void>;
  saveScheduledSurvey: (surveyTime: '5pm' | '9pm', data: Record<string, any>) => Promise<void>;
  saveBaselineSurvey: (data: Record<string, any>) => Promise<void>;
  saveEndlineSurvey: (data: Record<string, any>) => Promise<void>;
  saveFollowupSurvey: (data: Record<string, any>) => Promise<void>;

  // Prompt State
  setCurrentPrompt: (platform: string | null, sessionId: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      isAuthenticated: false,
      userId: null,
      user: null,
      isLoading: true,
      error: null,
      sampling: {
        promptsToday: 0,
        lastPromptTime: null,
        activeSessions: [],
      },
      currentPromptPlatform: null,
      currentSessionId: null,

      // Initialize App
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          const firebaseUser = await signInAnonymousUser();
          const userId = firebaseUser.uid;

          let user = await getUser(userId);

          if (!user) {
            // New user - create with random group assignment
            const group = randomlyAssignGroup();
            const participantId = generateParticipantId();
            const defaultSettings = {
              windowStart: APP_CONFIG.DEFAULT_WINDOW_START,
              windowEnd: APP_CONFIG.DEFAULT_WINDOW_END,
              trackedApps: SOCIAL_MEDIA_APPS.slice(0, 6).map((app) => app.id),
            };

            await createUser(userId, participantId, group, defaultSettings);
            user = await getUser(userId);
          }

          // Reset daily sampling if it's a new day
          const state = get();
          const lastPromptDate = state.sampling.lastPromptTime;
          if (lastPromptDate) {
            const today = new Date();
            const lastDate = new Date(lastPromptDate);
            if (today.toDateString() !== lastDate.toDateString()) {
              set({
                sampling: {
                  ...state.sampling,
                  promptsToday: 0,
                  lastPromptTime: null,
                },
              });
            }
          }

          set({
            isAuthenticated: true,
            userId,
            user,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize',
          });
        }
      },

      setUser: (user) => set({ user }),

      updatePhase: async (phase) => {
        const { userId, user } = get();
        if (!userId || !user) return;

        await updateUserPhase(userId, phase);

        const updates: Partial<User> = { studyPhase: phase };
        if (phase === 'intervention' && !user.studyStartDate) {
          updates.studyStartDate = new Date();
        }
        if (phase === 'endline') {
          updates.baselineCompletedAt = new Date();
        }

        set({ user: { ...user, ...updates } });
      },

      updateSettings: async (settings) => {
        const { userId, user } = get();
        if (!userId || !user) return;

        await updateUserSettings(userId, settings);
        set({
          user: {
            ...user,
            settings: { ...user.settings, ...settings },
          },
        });
      },

      // Session Management
      startAppSession: (platform) => {
        const sessionId = uuidv4();
        const newSession: AppSession = {
          id: sessionId,
          platform,
          openTime: new Date(),
          promptShown: false,
          satisfactionCollected: false,
        };

        set((state) => ({
          sampling: {
            ...state.sampling,
            activeSessions: [...state.sampling.activeSessions, newSession],
          },
        }));

        // Save app open event
        const { userId } = get();
        if (userId) {
          saveAppEvent(userId, {
            type: 'open',
            platform,
            timestamp: new Date(),
            sessionId,
            promptTriggered: false,
          });
        }

        return sessionId;
      },

      endAppSession: (sessionId) => {
        const { sampling, userId } = get();
        const session = sampling.activeSessions.find((s) => s.id === sessionId);

        if (session) {
          // Save app close event
          if (userId) {
            saveAppEvent(userId, {
              type: 'close',
              platform: session.platform,
              timestamp: new Date(),
              sessionId,
              promptTriggered: session.promptShown,
            });
          }

          set((state) => ({
            sampling: {
              ...state.sampling,
              activeSessions: state.sampling.activeSessions.filter(
                (s) => s.id !== sessionId
              ),
            },
          }));
        }
      },

      getActiveSession: (platform) => {
        const { sampling } = get();
        return sampling.activeSessions.find((s) => s.platform === platform);
      },

      // Sampling Logic
      canShowPrompt: () => {
        const { user, sampling } = get();
        if (!user) return false;

        // Check daily limit
        if (sampling.promptsToday >= APP_CONFIG.MAX_PROMPTS_PER_DAY) {
          return false;
        }

        // Check time window
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`;

        if (
          currentTime < user.settings.windowStart ||
          currentTime > user.settings.windowEnd
        ) {
          return false;
        }

        // Check minimum time between prompts
        if (sampling.lastPromptTime) {
          const timeSinceLastPrompt =
            now.getTime() - new Date(sampling.lastPromptTime).getTime();
          const minInterval = APP_CONFIG.MIN_HOURS_BETWEEN_PROMPTS * 60 * 60 * 1000;
          if (timeSinceLastPrompt < minInterval) {
            return false;
          }
        }

        return true;
      },

      recordPromptShown: () => {
        set((state) => ({
          sampling: {
            ...state.sampling,
            promptsToday: state.sampling.promptsToday + 1,
            lastPromptTime: new Date(),
          },
        }));
      },

      resetDailySampling: () => {
        set((state) => ({
          sampling: {
            ...state.sampling,
            promptsToday: 0,
            lastPromptTime: null,
          },
        }));
      },

      // Response Saving
      saveMRPResponse: async (platform, sessionId, response) => {
        const { userId } = get();
        if (!userId) return;

        await saveResponse(userId, {
          type: 'mrp',
          platform,
          data: { motivation: response },
          timestamp: new Date(),
          sessionId,
        });

        // Mark session as having shown prompt
        set((state) => ({
          sampling: {
            ...state.sampling,
            activeSessions: state.sampling.activeSessions.map((s) =>
              s.id === sessionId ? { ...s, promptShown: true } : s
            ),
          },
        }));
      },

      saveNPResponse: async (platform, sessionId, question, response) => {
        const { userId } = get();
        if (!userId) return;

        await saveResponse(userId, {
          type: 'np',
          platform,
          data: { question, response },
          timestamp: new Date(),
          sessionId,
        });

        // Mark session as having shown prompt
        set((state) => ({
          sampling: {
            ...state.sampling,
            activeSessions: state.sampling.activeSessions.map((s) =>
              s.id === sessionId ? { ...s, promptShown: true } : s
            ),
          },
        }));
      },

      saveSatisfactionResponse: async (platform, sessionId, satisfaction) => {
        const { userId } = get();
        if (!userId) return;

        await saveResponse(userId, {
          type: 'satisfaction',
          platform,
          data: { satisfaction },
          timestamp: new Date(),
          sessionId,
        });

        // Mark session as having collected satisfaction
        set((state) => ({
          sampling: {
            ...state.sampling,
            activeSessions: state.sampling.activeSessions.map((s) =>
              s.id === sessionId ? { ...s, satisfactionCollected: true } : s
            ),
          },
        }));
      },

      saveScheduledSurvey: async (surveyTime, data) => {
        const { userId } = get();
        if (!userId) return;

        await saveResponse(userId, {
          type: 'scheduled_survey',
          data: { surveyTime, ...data },
          timestamp: new Date(),
        });
      },

      saveBaselineSurvey: async (data) => {
        const { userId, user } = get();
        if (!userId || !user) return;

        await saveResponse(userId, {
          type: 'baseline',
          data,
          timestamp: new Date(),
        });

        await updateUser(userId, {
          baselineCompletedAt: new Date(),
          studyPhase: 'intervention',
          studyStartDate: new Date(),
        });

        set({
          user: {
            ...user,
            baselineCompletedAt: new Date(),
            studyPhase: 'intervention',
            studyStartDate: new Date(),
          },
        });
      },

      saveEndlineSurvey: async (data) => {
        const { userId, user } = get();
        if (!userId || !user) return;

        await saveResponse(userId, {
          type: 'endline',
          data,
          timestamp: new Date(),
        });

        await updateUser(userId, {
          endlineCompletedAt: new Date(),
          studyPhase: 'followup',
        });

        set({
          user: {
            ...user,
            endlineCompletedAt: new Date(),
            studyPhase: 'followup',
          },
        });
      },

      saveFollowupSurvey: async (data) => {
        const { userId, user } = get();
        if (!userId || !user) return;

        await saveResponse(userId, {
          type: 'followup',
          data,
          timestamp: new Date(),
        });

        await updateUser(userId, { studyPhase: 'completed' });
        set({ user: { ...user, studyPhase: 'completed' } });
      },

      setCurrentPrompt: (platform, sessionId) => {
        set({
          currentPromptPlatform: platform,
          currentSessionId: sessionId,
        });
      },
    }),
    {
      name: 'smu-study-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sampling: state.sampling,
      }),
    }
  )
);
