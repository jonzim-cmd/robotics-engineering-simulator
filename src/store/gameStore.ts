import { create } from 'zustand';

type LevelState = 'INTRO' | 'ACTIVE' | 'SUCCESS' | 'FAIL';

interface StateHistoryEntry {
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
  popStateHistory: () => void;
  clearStateHistory: () => void;
  advanceLevel: () => void;
  previousLevel: () => void;
  returnToDashboard: () => void;
  setUserName: (name: string) => void;
  setSkipAnimations: (skip: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
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
  pushStateHistory: () => set((state) => ({
    stateHistory: [...state.stateHistory, { levelState: state.levelState, credits: state.credits }]
  })),
  popStateHistory: () => set((state) => {
    if (state.stateHistory.length === 0) {
      return state;
    }
    const history = [...state.stateHistory];
    const previousState = history.pop()!;
    return {
      stateHistory: history,
      levelState: previousState.levelState,
      credits: previousState.credits,
    };
  }),
  clearStateHistory: () => set({ stateHistory: [] }),
  advanceLevel: () => set((state) => ({ currentLevel: state.currentLevel + 1, levelState: 'INTRO', skipAnimations: false, stateHistory: [] })),
  previousLevel: () => set((state) => ({ currentLevel: Math.max(0, state.currentLevel - 1), levelState: 'INTRO', skipAnimations: false, stateHistory: [] })),
  returnToDashboard: () => set({ currentLevel: 0, levelState: 'INTRO', skipAnimations: true, stateHistory: [] }),
  setUserName: (name) => set({ userName: name }),
  setSkipAnimations: (skip) => set({ skipAnimations: skip }),
}));
