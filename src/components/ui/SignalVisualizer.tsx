import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SignalVisualizerProps {
  threshold: number;
  onThresholdChange: (val: number) => void;
  isSimulating: boolean;
}

export const SignalVisualizer: React.FC<SignalVisualizerProps> = ({ 
  threshold, 
  onThresholdChange,
  isSimulating 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Simulation Parameters
  // Signal range: 0 to 1.0
  // Wall signal: ~0.8 to 0.9
  // Noise floor: ~0.0 to 0.3 (random spikes up to 0.4)
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;
    
    // Data buffer for the graph
    const points: number[] = [];
    const maxPoints = 200;
    
    // Initialize with noise
    for (let i = 0; i < maxPoints; i++) {
      points.push(Math.random() * 0.2);
    }

    const render = () => {
      if (!canvas) return;
      
      // Resize handling
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // 1. Update Data
      if (isSimulating) {
        offset += 0.5;
        points.shift();
        
        // Generate new signal point
        let newVal = Math.random() * 0.25; // Base noise (0.0 - 0.25)
        
        // Occasional larger noise spikes (Ghost objects)
        if (Math.random() > 0.95) {
           newVal += Math.random() * 0.2; // Spikes up to 0.45
        }
        
        // Periodic REAL Wall signal (every ~100 frames)
        const cycle = (offset % 200);
        if (cycle > 150 && cycle < 180) {
            newVal = 0.8 + (Math.random() * 0.1); // Strong signal (0.8 - 0.9)
        }
        
        points.push(newVal);
      }

      // 2. Clear
      ctx.clearRect(0, 0, width, height);
      
      // 3. Draw Grid
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y < height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();

      // 4. Draw Signal
      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee'; // cyan-400
      ctx.lineWidth = 2;
      
      // Map points to canvas coords (Y is inverted: 1.0 is top)
      // But in typical oscilloscope, 0 is bottom. So: y = height - (val * height)
      points.forEach((val, i) => {
        const x = (i / maxPoints) * width;
        const y = height - (val * height); // 0 at bottom
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // 5. Draw Threshold Line
      // threshold is 0.0 to 1.0
      const threshY = height - (threshold * height);
      
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24'; // amber-400
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, threshY);
      ctx.lineTo(width, threshY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Threshold Label
      ctx.fillStyle = '#fbbf24';
      ctx.font = '12px monospace';
      ctx.fillText(`THRESHOLD: ${(threshold * 5).toFixed(2)}V`, 10, threshY - 5);
      
      // 6. Visualize Detection (Red dots where signal > threshold)
      ctx.fillStyle = '#ef4444';
      points.forEach((val, i) => {
          if (val > threshold) {
              const x = (i / maxPoints) * width;
              const y = height - (val * height);
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fill();
          }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [threshold, isSimulating]);

  return (
    <div className="w-full h-full relative bg-slate-950 rounded border border-slate-800 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Slider Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 p-4 rounded border border-slate-700 backdrop-blur">
        <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">EMPFINDLICH (0V)</span>
            <span className="text-yellow-400 font-bold">SCHWELLENWERT EINSTELLEN</span>
            <span className="text-slate-400">UNEMPFINDLICH (5V)</span>
        </div>
        <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={threshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
        />
      </div>
    </div>
  );
};
