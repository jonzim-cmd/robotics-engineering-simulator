import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LogEntry {
  id: number;
  timestamp: string;
  source: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
}

const LOG_TEMPLATES = [
  { source: 'SENSOR_01', message: 'Distanz: 245cm (OK)', type: 'INFO' },
  { source: 'SENSOR_01', message: 'Distanz: 244cm (OK)', type: 'INFO' },
  { source: 'SENSOR_02', message: 'Scan Bereich A... Leer', type: 'INFO' },
  { source: 'SYS_CORE', message: 'Heartbeat Signal... OK', type: 'INFO' },
  { source: 'MOTOR_L', message: 'Drehzahl 1200 rpm', type: 'INFO' },
  { source: 'MOTOR_R', message: 'Drehzahl 1200 rpm', type: 'INFO' },
  { source: 'SENSOR_01', message: 'Distanz: 0.4cm (KRITISCH)', type: 'WARN' },
  { source: 'COLLISION', message: 'HINDERNIS ERKANNT! NOT-STOPP', type: 'ERROR' },
  { source: 'NAV_SYS', message: 'Pfad neu berechnen...', type: 'WARN' },
  { source: 'SENSOR_01', message: 'Distanz: 0.0cm (FEHLER)', type: 'CRITICAL' },
  { source: 'SYS_CORE', message: 'Unbekannter Fehler in Sektor 7', type: 'ERROR' },
  { source: 'MOTOR_CTL', message: 'Rückwärtsgang eingelegt', type: 'WARN' },
  { source: 'SENSOR_03', message: 'Interferenz erkannt', type: 'WARN' },
  { source: 'SENSOR_01', message: 'Distanz: 245cm (OK)', type: 'INFO' },
];

export const LogTerminal: React.FC<{ isRunning?: boolean }> = ({ isRunning = true }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Initial logs
  useEffect(() => {
    const initialLogs = Array.from({ length: 10 }).map(() => generateRandomLog(nextId.current++));
    setLogs(initialLogs);
  }, []);

  // Add logs periodically
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const newLog = generateRandomLog(nextId.current++);
      setLogs(prev => [...prev.slice(-30), newLog]); // Keep last 30 logs
    }, 200); // Fast updates

    return () => clearInterval(interval);
  }, [isRunning]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const generateRandomLog = (id: number): LogEntry => {
    const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    return {
      id,
      timestamp: timeStr,
      source: template.source,
      message: template.message,
      type: template.type as any,
    };
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'text-green-400';
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-orange-500';
      case 'CRITICAL': return 'text-red-500 font-bold';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="font-mono text-xs bg-black/90 p-4 rounded border border-slate-800 h-full flex flex-col shadow-inner">
      <div className="border-b border-slate-800 pb-2 mb-2 text-slate-500 flex justify-between uppercase tracking-wider text-[10px]">
        <span>System Log Stream</span>
        <span className={isRunning ? "text-green-500 animate-pulse" : "text-red-500"}>
          {isRunning ? "● LIVE" : "● PAUSED"}
        </span>
      </div>
      
      <div ref={scrollRef} className="overflow-y-hidden flex-1 space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 opacity-90 hover:opacity-100">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className="text-cyan-700 shrink-0 w-20">{log.source}:</span>
            <span className={`${getTypeColor(log.type)} break-all`}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
