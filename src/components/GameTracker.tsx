'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { trackEvent } from '@/app/actions';

export const GameTracker = () => {
  const { currentLevel, credits, userId, userName } = useGameStore();
  
  // Ref to track previous level to distinguish between initial load and actual change
  const prevLevelRef = useRef(currentLevel);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip tracking if no user is logged in
    if (!userId) return;

    // Logic for Level Change
    if (currentLevel !== prevLevelRef.current || (isFirstRender.current && currentLevel > 0)) {
      const eventType = currentLevel > prevLevelRef.current ? 'LEVEL_ADVANCE' : 'LEVEL_JUMP';
      
      trackEvent(userId, currentLevel, eventType, {
        credits: credits,
        previousLevel: prevLevelRef.current,
        timestamp: new Date().toISOString()
      }).catch(err => console.error("Tracking failed", err));
      
      prevLevelRef.current = currentLevel;
    }
    
    isFirstRender.current = false;
  }, [currentLevel, userId, credits]); // We include credits to satisfy linter, but logic relies on level change

  return null; // This component renders nothing
};
