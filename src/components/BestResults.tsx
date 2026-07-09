import { motion } from 'framer-motion';
import { ScanResult, DNSResult, CDNResult, ScanMode } from '../types';

interface BestResultsProps {
  mode: ScanMode;
  results: ScanResult[] | DNSResult[] | CDNResult[];
}

export default function BestResults({ mode, results }: BestResultsProps) {
  if (results.length === 0) return null;

  const renderIPBest = () => {
    const ipResults = (results as ScanResult[]).filter(r => r.status === 'online');
    const sorted = [...ipResults].sort((a, b) => a.latency - b.latency);
    const top5 = sorted.slice(0, 5);

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏆</span> بهترین آی‌پی‌ها (تمیزترین)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {top5.map((result, index) => (
            <motion.div
              key={result.ip}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border p-4 ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                  : index === 1
                  ? 'bg-gradient-to-br from-slate-300/10 to-slate-400/10 border-slate-400/30'
                  : index === 2
                  ? 'bg-gradient-to-br from-amber-700/10 to-orange-600/10 border-amber-700/30'
                  : 'bg-slate-800/50 border-slate-700/30'
              }`}
            >
              {index < 3 && (
                <div className="absolute top-2 left-2 text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
              )}
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">رتبه #{index + 1}</p>
                <p className="font-mono text-sm text-blue-300 font-bold mb-2">{result.ip}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400 font-bold">{result.latency}ms</span>
                    <span className="text-slate-500">لیتنسی</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{result.loss}%</span>
                    <span className="text-slate-500">پکت لاس</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{result.jitter}ms</span>
                    <span className="text-slate-500">جیتر</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-cyan-400">{result.provider}</span>
                    <span className="text-slate-500">سرویس</span>
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(result.ip)}
                  className="mt-3 w-full py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 hover:bg-blue-500/30 transition-colors"
                >
                  📋 کپی آی‌پی
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderDNSBest = () => {
    const dnsResults = (results as DNSResult[]).filter(r => r.status === 'success');
    const grouped = dnsResults.reduce((acc, r) => {
      if (!acc[r.server] || r.latency < acc[r.server].latency) {
        acc[r.server] = r;
      }
      return acc;
    }, {} as Record<string, DNSResult>);
    const sorted = Object.values(grouped).sort((a, b) => a.latency - b.latency);
    const top5 = sorted.slice(0, 5);

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏆</span> سریع‌ترین DNS ها
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {top5.map((result, index) => (
            <motion.div
              key={result.ip}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border p-4 ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                  : index === 1
                  ? 'bg-gradient-to-br from-slate-300/10 to-slate-400/10 border-slate-400/30'
                  : index === 2
                  ? 'bg-gradient-to-br from-amber-700/10 to-orange-600/10 border-amber-700/30'
                  : 'bg-slate-800/50 border-slate-700/30'
              }`}
            >
              {index < 3 && (
                <div className="absolute top-2 left-2 text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
              )}
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">رتبه #{index + 1}</p>
                <p className="text-sm text-white font-bold mb-1">{result.server}</p>
                <p className="font-mono text-xs text-blue-300 mb-2">{result.ip}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400 font-bold">{result.latency}ms</span>
                    <span className="text-slate-500">لیتنسی</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{result.reliability}%</span>
                    <span className="text-slate-500">قابلیت اطمینان</span>
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(result.ip)}
                  className="mt-3 w-full py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 hover:bg-blue-500/30 transition-colors"
                >
                  📋 کپی DNS
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderCDNBest = () => {
    const cdnResults = results as CDNResult[];
    const sorted = [...cdnResults].sort((a, b) => a.latency - b.latency);
    const top5 = sorted.slice(0, 5);

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🏆</span> سریع‌ترین CDN ها
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {top5.map((result, index) => (
            <motion.div
              key={result.provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-xl border p-4 ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                  : index === 1
                  ? 'bg-gradient-to-br from-slate-300/10 to-slate-400/10 border-slate-400/30'
                  : index === 2
                  ? 'bg-gradient-to-br from-amber-700/10 to-orange-600/10 border-amber-700/30'
                  : 'bg-slate-800/50 border-slate-700/30'
              }`}
            >
              {index < 3 && (
                <div className="absolute top-2 left-2 text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
              )}
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">رتبه #{index + 1}</p>
                <p className="text-sm text-white font-bold mb-2">{result.provider}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400 font-bold">{result.latency}ms</span>
                    <span className="text-slate-500">لیتنسی</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-cyan-400 font-bold">{result.ttfb}ms</span>
                    <span className="text-slate-500">TTFB</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400 font-bold">{result.downloadSpeed} MB/s</span>
                    <span className="text-slate-500">سرعت</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{result.location}</span>
                    <span className="text-slate-500">لوکیشن</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 sm:p-6"
    >
      {mode === 'ip' && renderIPBest()}
      {mode === 'dns' && renderDNSBest()}
      {mode === 'cdn' && renderCDNBest()}
    </motion.div>
  );
}
