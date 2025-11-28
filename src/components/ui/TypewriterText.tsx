'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  onComplete,
  className = ""
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Auto-scroll to keep the cursor in view (respecting parent padding)
  useEffect(() => {
    if (textRef.current) {
      let currentEl: HTMLElement | null = textRef.current.parentElement;
      while (currentEl) {
        const style = window.getComputedStyle(currentEl);
        if (style.overflowY === 'scroll' || style.overflowY === 'auto') {
          currentEl.scrollTop = currentEl.scrollHeight;
          break;
        }
        currentEl = currentEl.parentElement;
      }
    }
  }, [displayedText]);

  useEffect(() => {
    setDisplayedText("");
    const characters = Array.from(text);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < characters.length) {
        currentIndex++;
        setDisplayedText(characters.slice(0, currentIndex).join(''));
      } else {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span ref={textRef} className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-2 h-4 bg-cyan-500 ml-1 align-middle"
      />
    </span>
  );
};
