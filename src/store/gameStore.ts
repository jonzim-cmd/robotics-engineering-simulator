import { create } from 'zustand';

type LevelState = 'INTRO' | 'ACTIVE' | 'SUCCESS' | 'FAIL';

const MAX_HISTORY_SIZE = 50; // Prevent memory issues

interface StateHistoryEntry {
  currentLevel: number;
  levelState: LevelState;
  credits: number;
}

interface GameState {
  currentLevel: number;
  credits: number;
  levelState: LevelState;
  userName: string;
  skipAnimations: boolean;
  stateHistory: StateHistoryEntry[];
  setLevel: (level: number) => void;
  setCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  removeCredits: (amount: number) => void;
  setLevelState: (state: LevelState) => void;
  pushStateHistory: () => void;
  popStateHistory: () => boolean; // Returns true if pop was successful
  clearStateHistory: () => void;
  advanceLevel: () => void;
  previousLevel: () => void; // Deprecated: Use popStateHistory instead
  returnToDashboard: () => void;
  setUserName: (name: string) => void;
  setSkipAnimations: (skip: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentLevel: 0,
  credits: 50, // Starting credits placeholder
  levelState: 'INTRO',
  userName: '',
  skipAnimations: false,
  stateHistory: [],

  setLevel: (level) => set({ currentLevel: level, levelState: 'INTRO', skipAnimations: false, stateHistory: [] }),
  setCredits: (credits) => set({ credits }),
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
  removeCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  setLevelState: (state) => set({ levelState: state }),

  pushStateHistory: () => set((state) => {
    const newEntry: StateHistoryEntry = {
      currentLevel: state.currentLevel,
      levelState: state.levelState,
      credits: state.credits,
    };

    let newHistory = [...state.stateHistory, newEntry];

    // Keep history size manageable
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory = newHistory.slice(-MAX_HISTORY_SIZE);
    }

    return { stateHistory: newHistory };
  }),

  popStateHistory: () => {
    const state = get();
    if (state.stateHistory.length === 0) {
      return false; // Nothing to pop
    }

    const history = [...state.stateHistory];
    const previousState = history.pop()!;

    set({
      stateHistory: history,
      currentLevel: previousState.currentLevel,
      levelState: previousState.levelState,
      credits: previousState.credits,
    });

    return true; // Pop was successful
  },

  clearStateHistory: () => set({ stateHistory: [] }),

  advanceLevel: () => {
    // CRUCIAL: Save current state BEFORE advancing
    get().pushStateHistory();
    set((state) => ({
      currentLevel: state.currentLevel + 1,
      levelState: 'INTRO',
      skipAnimations: false
      // DO NOT clear stateHistory - this is the key to global history!
    }));
  },

  // Deprecated: Kept for backwards compatibility, but now uses popStateHistory
  previousLevel: () => {
    const success = get().popStateHistory();
    if (!success) {
      // Fallback: If no history, go to previous level intro
      set((state) => ({
        currentLevel: Math.max(0, state.currentLevel - 1),
        levelState: 'INTRO',
        skipAnimations: false
      }));
    }
  },

  returnToDashboard: () => {
    // Save state before returning to dashboard
    get().pushStateHistory();
    set({ currentLevel: 0, levelState: 'INTRO', skipAnimations: true });
  },

  setUserName: (name) => set({ userName: name }),
  setSkipAnimations: (skip) => set({ skipAnimations: skip }),
}));
