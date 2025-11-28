import { create } from 'zustand';

type LevelState = 'INTRO' | 'ACTIVE' | 'SUCCESS' | 'FAIL';

const MAX_HISTORY_SIZE = 50; // Prevent memory issues

interface StateHistoryEntry {
  currentLevel: number;
  levelState: LevelState;
  credits: number;
  subStep: number;
}

interface GameState {
  currentLevel: number;
  credits: number;
  levelState: LevelState;
  userName: string;
  skipAnimations: boolean;
  subStep: number;
  stateHistory: StateHistoryEntry[];
  setLevel: (level: number) => void;
  setCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  removeCredits: (amount: number) => void;
  setLevelState: (state: LevelState) => void;
  setSubStep: (step: number) => void;
  pushStateHistory: () => void;
  popStateHistory: () => boolean; // Returns true if pop was successful
  clearStateHistory: () => void;
  advanceLevel: (skipHistoryPush?: boolean) => void;
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
  subStep: 0,
  stateHistory: [],

  setLevel: (level) => set({ currentLevel: level, levelState: 'INTRO', skipAnimations: false, subStep: 0, stateHistory: [] }),
  setCredits: (credits) => set({ credits }),
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
  removeCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  setLevelState: (state) => set({ levelState: state }),
  setSubStep: (step) => set({ subStep: step }),

  pushStateHistory: () => set((state) => {
    const newEntry: StateHistoryEntry = {
      currentLevel: state.currentLevel,
      levelState: state.levelState,
      credits: state.credits,
      subStep: state.subStep,
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
      subStep: previousState.subStep,
    });

    return true; // Pop was successful
  },

  clearStateHistory: () => set({ stateHistory: [] }),

  advanceLevel: (skipHistoryPush = false) => {
    // CRUCIAL: Save current state BEFORE advancing
    if (!skipHistoryPush) {
      get().pushStateHistory();
    }
    set((state) => ({
      currentLevel: state.currentLevel + 1,
      levelState: 'INTRO',
      skipAnimations: false,
      subStep: 0
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
        skipAnimations: false,
        subStep: 0
      }));
    }
  },

  returnToDashboard: () => {
    // Save state before returning to dashboard
    get().pushStateHistory();
    set({ currentLevel: 0, levelState: 'INTRO', skipAnimations: true, subStep: 0 });
  },

  setUserName: (name) => set({ userName: name }),
  setSkipAnimations: (skip) => set({ skipAnimations: skip }),
}));
