'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  title: string;
  content: string;
}

interface YoutubeResearchProps {
  searchResults: SearchResult[];
  onComplete: () => void;
}

export const YoutubeResearch: React.FC<YoutubeResearchProps> = ({
  searchResults,
  onComplete,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isLastPage = currentPage === searchResults.length - 1;
  const isFirstPage = currentPage === 0;

  const handleNext = () => {
    if (isLastPage) {
      onComplete();
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Format content logic adapted from SmartphoneResearch for dark video theme
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    const formatted: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    let inMerkeBlock = false;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join('\n');
        if (inMerkeBlock) {
          formatted.push(
            <div
              key={formatted.length}
              className="bg-gray-800/80 border-l-4 border-red-600 p-2 md:p-3 my-2 rounded-r shadow-lg"
            >
              <div className="font-bold text-red-400 text-sm mb-1 uppercase tracking-wider">💡 Merke:</div>
              <div className="text-gray-100 text-sm whitespace-pre-wrap leading-normal">
                {text.replace(/^Merke:\s*/i, '')}
              </div>
            </div>
          );
          inMerkeBlock = false;
        } else {
          formatted.push(
            <p key={formatted.length} className="mb-2 text-gray-200 text-sm md:text-base leading-normal whitespace-pre-wrap">
              {text}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      // Check for "Merke:" block
      if (line.trim().match(/^Merke:/i)) {
        flushParagraph();
        inMerkeBlock = true;
        currentParagraph.push(line.trim());
      }
      // Check for list items (starting with • or -)
      else if (line.trim().match(/^[•\-]\s/)) {
        flushParagraph();
        formatted.push(
          <div key={formatted.length} className="flex gap-2 mb-1 ml-3 md:ml-4 items-start">
            <span className="text-red-500 font-bold text-base mt-0.5">•</span>
            <span className="text-gray-200 text-sm md:text-base leading-normal">{line.trim().replace(/^[•\-]\s/, '')}</span>
          </div>
        );
      }
      // Empty line - flush paragraph
      else if (line.trim() === '') {
        flushParagraph();
      }
      // Regular line
      else {
        currentParagraph.push(line);
      }
    });

    // Flush any remaining paragraph
    flushParagraph();

    return formatted;
  };

  const currentResult = searchResults[currentPage];
  // Calculate progress based on pages (video duration simulation)
  const progress = ((currentPage) / (searchResults.length - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-5xl h-[85vh] md:h-auto md:aspect-video bg-black rounded-xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative group"
      >
        {/* Video Content Layer */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
          
          {/* Top Overlay (Title) - Fades out when not hovering, like YT controls */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/90 to-transparent z-20 pointer-events-none">
             <h2 className="text-white text-xl md:text-2xl font-bold tracking-tight leading-tight pr-12">{currentResult.title}</h2>
          </div>

          {/* Main Text Content Area - Centered like subtitles or presentation slides */}
          {/* Added pt-24 to prevent title overlap and improved responsiveness */}
          <div className="absolute inset-0 overflow-y-auto pt-24 md:pt-28 px-6 md:px-16 pb-8 flex flex-col items-center z-10 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-3xl"
                >
                   {formatContent(currentResult.content)}
                </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="bg-black/90 border-t border-gray-800 px-3 py-3 md:px-4 z-30 shrink-0">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-700 mb-4 relative cursor-pointer group/progress rounded-full overflow-hidden">
               <div 
                 className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-500 ease-out"
                 style={{ width: `${Math.max(0, progress)}%` }} // Ensure min 0%
               />
               <div 
                 className="absolute top-0 h-full w-3 bg-red-600 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity transform -translate-y-1/4 -translate-x-1.5"
                 style={{ left: `${progress}%` }}
               />
            </div>

            <div className="flex items-center justify-between text-white gap-2 md:gap-4">
                <div className="flex items-center gap-3 md:gap-6 overflow-hidden">
                    {/* Play/Pause Button (Visual Only) */}
                    <button className="hover:text-red-500 transition-colors shrink-0" aria-label="Play">
                        <svg className="w-6 h-6 md:w-8 md:h-8 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    
                    {/* Previous Button (Rewind) */}
                    <button 
                      onClick={handlePrevious} 
                      disabled={isFirstPage}
                      className={`flex items-center gap-1 hover:text-red-500 transition-colors ${isFirstPage ? 'text-gray-600 cursor-not-allowed' : ''}`}
                      aria-label="Zurückspulen 1 min"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                      <span className="text-xs md:text-sm whitespace-nowrap">1 min zurück</span>
                    </button>

                    {/* Volume (Visual Only - Hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-2 group/volume">
                        <button className="hover:text-gray-300" aria-label="Volume">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                        </button>
                        <div className="w-0 overflow-hidden group-hover/volume:w-16 transition-all duration-300">
                             <div className="h-1 bg-white rounded-full w-12 ml-2"></div>
                        </div>
                    </div>

                    {/* Time */}
                    <span className="text-xs md:text-sm font-mono text-gray-400 whitespace-nowrap">
                        {currentPage + 1}:00 / {searchResults.length}:00
                    </span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Settings Cog (Visual Only - Hidden on small screens) */}
                    <button className="hidden sm:block text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.49l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                    </button>

                    {/* Fullscreen (Visual Only - Hidden on small screens) */}
                    <button className="hidden sm:block text-gray-400 hover:text-white transition-colors mr-2 md:mr-4">
                         <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm font-medium transition-colors text-xs md:text-sm uppercase tracking-wide whitespace-nowrap"
                    >
                        <span>{isLastPage ? 'Fertig' : '1 min vor'}</span>
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
