import { create } from 'zustand';

type LevelState = 'INTRO' | 'ACTIVE' | 'SUCCESS' | 'FAIL';

interface GameState {
  currentLevel: number;
  credits: number;
  levelState: LevelState;
  userName: string;
  skipAnimations: boolean;
  setLevel: (level: number) => void;
  setCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  removeCredits: (amount: number) => void;
  setLevelState: (state: LevelState) => void;
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
  setLevel: (level) => set({ currentLevel: level, levelState: 'INTRO', skipAnimations: false }),
  setCredits: (credits) => set({ credits }),
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
  removeCredits: (amount) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  setLevelState: (state) => set({ levelState: state }),
  advanceLevel: () => set((state) => ({ currentLevel: state.currentLevel + 1, levelState: 'INTRO', skipAnimations: false })),
  previousLevel: () => set((state) => ({ currentLevel: Math.max(0, state.currentLevel - 1), levelState: 'INTRO', skipAnimations: false })),
  returnToDashboard: () => set({ currentLevel: 0, levelState: 'INTRO', skipAnimations: true }),
  setUserName: (name) => set({ userName: name }),
  setSkipAnimations: (skip) => set({ skipAnimations: skip }),
}));
