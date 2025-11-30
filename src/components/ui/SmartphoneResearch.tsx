'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  title: string;
  content: string;
}

interface SmartphoneResearchProps {
  searchResults: SearchResult[];
  onComplete: () => void;
  searchQuery?: string;
  browserTitle?: string;
  onBack?: () => void;
}

export const SmartphoneResearch: React.FC<SmartphoneResearchProps> = ({
  searchResults,
  onComplete,
  searchQuery = 'Suche',
  browserTitle = 'Suche',
  onBack,
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

  // Format content with special formatting for "Merke:" and lists
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
              className="bg-cyan-50 border-l-4 border-cyan-400 p-3 my-3 rounded-r"
            >
              <div className="font-bold text-cyan-900 text-sm mb-1">💡 Merke:</div>
              <div className="text-cyan-900 text-sm whitespace-pre-wrap">
                {text.replace(/^Merke:\s*/i, '')}
              </div>
            </div>
          );
          inMerkeBlock = false;
        } else {
          formatted.push(
            <p key={formatted.length} className="mb-3 text-slate-700 leading-relaxed whitespace-pre-wrap">
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
          <div key={formatted.length} className="flex gap-2 mb-2 ml-4">
            <span className="text-cyan-600 font-bold">•</span>
            <span className="text-slate-700">{line.trim().replace(/^[•\-]\s/, '')}</span>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-sm"
      >
        {/* Smartphone Frame */}
        <div className="w-full bg-slate-900 rounded-2xl sm:rounded-[3rem] p-2 sm:p-3 shadow-2xl border-4 sm:border-8 border-slate-800">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-6 sm:h-7 bg-slate-900 rounded-b-2xl sm:rounded-b-3xl z-10 flex items-center justify-center gap-2">
            <div className="w-10 sm:w-12 h-1 bg-slate-800 rounded-full mt-2" />
            <div className="w-2 h-2 bg-slate-700 rounded-full mt-2" />
          </div>

          {/* Screen */}
          <div className="bg-white rounded-xl sm:rounded-[2.5rem] overflow-hidden shadow-inner h-[75vh] sm:h-[80vh] max-h-[667px] flex flex-col">
            {/* Browser UI */}
            <div className="bg-slate-100 border-b border-slate-300">
              {/* Tab Bar */}
              <div className="flex items-center gap-1 px-2 pt-8 pb-1">
                <div className="bg-white rounded-t px-3 py-1 flex items-center gap-2 border-t border-x border-slate-300 flex-1">
                  <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs text-slate-700 truncate">{browserTitle}</span>
                </div>
              </div>

              {/* Address Bar */}
              <div className="px-3 pb-2 flex items-center gap-2">
                {onBack ? (
                  <button onClick={onBack} className="p-1 text-slate-600 hover:text-slate-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                ) : (
                  <button className="p-1 text-slate-400" disabled>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <button className="p-1 text-slate-400" disabled>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-xs text-slate-600 border border-slate-300">
                  <span className="text-slate-400">🔒</span> www.suche.de/results?q={searchQuery}
                </div>
                <button className="p-1 text-slate-400" disabled>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
                >
                  {/* Result Header */}
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    SUCHERGEBNIS {currentPage + 1}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {currentResult.title}
                  </h2>

                  {/* Content */}
                  <div className="text-sm">
                    {formatContent(currentResult.content)}
                  </div>

                  {/* Source */}
                  <div className="mt-6 pt-3 border-t border-slate-200 text-xs text-slate-400">
                    www.technik-lexikon.de
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Bar */}
            <div className="bg-white border-t border-slate-300 p-4 flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirstPage}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                  isFirstPage
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-600 text-white hover:bg-slate-700 active:bg-slate-800 shadow-sm'
                }`}
              >
                ← Zurück
              </button>

              <div className="text-xs sm:text-sm font-mono text-slate-600">
                {currentPage + 1} / {searchResults.length}
              </div>

              <button
                onClick={handleNext}
                className="px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 shadow-sm"
              >
                {isLastPage ? 'Weiter →' : 'Nächste →'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
