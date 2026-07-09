import { motion } from 'framer-motion';
import { ScanMode } from '../types';

interface HeaderProps {
  activeMode: ScanMode;
  onModeChange: (mode: ScanMode) => void;
}

const tabs: { id: ScanMode; label: string; icon: string; description: string }[] = [
  { id: 'ip', label: 'Clean IP Scanner', icon: '🔍', description: 'اسکن تمیزترین آی‌پی' },
  { id: 'dns', label: 'DNS Scanner', icon: '🌐', description: 'اسکن سرعت DNS' },
  { id: 'cdn', label: 'CDN Speed Test', icon: '⚡', description: 'تست سرعت CDN' },
];

export default function Header({ activeMode, onModeChange }: HeaderProps) {
  return (
    <header className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                🛡️
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Net<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Scan</span> Pro
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            اسکنر حرفه‌ای آی‌پی، DNS و CDN | قابل نصب روی Cloudflare Workers
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-800/60 backdrop-blur-xl rounded-2xl p-1.5 border border-slate-700/50 shadow-2xl">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onModeChange(tab.id)}
                className={`relative px-4 sm:px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeMode === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeMode === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/25"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 text-lg">{tab.icon}</span>
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                <span className="relative z-10 sm:hidden">{tab.description}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
