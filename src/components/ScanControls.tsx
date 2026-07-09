import { motion } from 'framer-motion';
import { ScanMode, ScanStatus } from '../types';
import { ipProviders } from '../data/providers';

interface ScanControlsProps {
  mode: ScanMode;
  status: ScanStatus;
  progress: number;
  selectedProviders: string[];
  ipsPerProvider: number;
  onToggleProvider: (provider: string) => void;
  onIpsPerProviderChange: (count: number) => void;
  onStartScan: () => void;
  onStopScan: () => void;
}

export default function ScanControls({
  mode,
  status,
  progress,
  selectedProviders,
  ipsPerProvider,
  onToggleProvider,
  onIpsPerProviderChange,
  onStartScan,
  onStopScan,
}: ScanControlsProps) {
  const isScanning = status === 'scanning';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 sm:p-6"
    >
      {mode === 'ip' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span>🏢</span> انتخاب سرویس‌دهنده‌ها
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ipProviders.map((provider) => {
              const isSelected = selectedProviders.includes(provider.provider);
              return (
                <button
                  key={provider.provider}
                  onClick={() => onToggleProvider(provider.provider)}
                  disabled={isScanning}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:border-slate-500/50'
                  } ${isScanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span>{provider.icon}</span>
                  <span>{provider.name}</span>
                  {isSelected && <span className="mr-auto text-blue-400">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="text-sm text-slate-400">تعداد آی‌پی برای هر سرویس:</label>
            <div className="flex items-center gap-2">
              {[5, 10, 20, 50].map((count) => (
                <button
                  key={count}
                  onClick={() => onIpsPerProviderChange(count)}
                  disabled={isScanning}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    ipsPerProvider === count
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:border-slate-500/50'
                  } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'dns' && (
        <div className="mb-6">
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <span>ℹ️</span>
            اسکن تمام سرورهای DNS شامل سرویس‌های بین‌المللی و ایرانی
          </p>
        </div>
      )}

      {mode === 'cdn' && (
        <div className="mb-6">
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <span>ℹ️</span>
            تست سرعت و لیتنسی تمام سرویس‌دهنده‌های CDN
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {isScanning && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">در حال اسکن...</span>
            <span className="text-xs font-mono text-blue-400">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full relative"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: isScanning ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isScanning ? onStopScan : onStartScan}
          className={`flex-1 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
            isScanning
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
          }`}
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              <span>توقف اسکن</span>
            </>
          ) : (
            <>
              <span className="text-lg">🚀</span>
              <span>
                {mode === 'ip' ? 'شروع اسکن آی‌پی' : mode === 'dns' ? 'شروع اسکن DNS' : 'شروع تست CDN'}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
