import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface LiveLogProps {
  logs: LogEntry[];
  isScanning: boolean;
}

export default function LiveLog({ logs, isScanning }: LiveLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return '›';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-slate-400 font-mono mr-2">terminal</span>
        </div>
        {isScanning && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">LIVE</span>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="p-4 h-48 overflow-y-auto font-mono text-xs space-y-1 custom-scrollbar"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-8">
            <p>منتظر شروع اسکن...</p>
            <p className="mt-1 text-slate-700">$ netscan --start</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2"
            >
              <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
              <span className={`${getTypeColor(log.type)} flex-shrink-0`}>{getTypeIcon(log.type)}</span>
              <span className="text-slate-300">{log.message}</span>
            </motion.div>
          ))
        )}
        {isScanning && (
          <div className="flex items-center gap-1 text-slate-500">
            <span>$</span>
            <span className="animate-pulse">▊</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
