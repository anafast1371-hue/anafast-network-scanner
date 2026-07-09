import { motion } from 'framer-motion';
import { ScanResult, DNSResult, CDNResult, ScanMode } from '../types';

interface StatsCardsProps {
  mode: ScanMode;
  results: ScanResult[] | DNSResult[] | CDNResult[];
  scanTime?: number;
}

export default function StatsCards({ mode, results, scanTime }: StatsCardsProps) {
  const getStats = () => {
    if (results.length === 0) {
      return [
        { label: 'اسکن شده', value: '0', icon: '📊', color: 'from-blue-500 to-blue-600' },
        { label: 'بهترین', value: '-', icon: '🏆', color: 'from-green-500 to-emerald-600' },
        { label: 'میانگین', value: '-', icon: '📈', color: 'from-amber-500 to-orange-600' },
        { label: 'زمان اسکن', value: '-', icon: '⏱️', color: 'from-purple-500 to-violet-600' },
      ];
    }

    if (mode === 'ip') {
      const ipResults = results as ScanResult[];
      const onlineResults = ipResults.filter((r) => r.status === 'online');
      const bestLatency = onlineResults.length > 0
        ? Math.min(...onlineResults.map((r) => r.latency))
        : 0;
      const avgLatency = onlineResults.length > 0
        ? onlineResults.reduce((a, b) => a + b.latency, 0) / onlineResults.length
        : 0;

      return [
        { label: 'اسکن شده', value: `${ipResults.length}`, icon: '📊', color: 'from-blue-500 to-blue-600', sub: `${onlineResults.length} آنلاین` },
        { label: 'بهترین لیتنسی', value: `${bestLatency.toFixed(1)}ms`, icon: '🏆', color: 'from-green-500 to-emerald-600' },
        { label: 'میانگین لیتنسی', value: `${avgLatency.toFixed(1)}ms`, icon: '📈', color: 'from-amber-500 to-orange-600' },
        { label: 'زمان اسکن', value: scanTime ? `${(scanTime / 1000).toFixed(1)}s` : '-', icon: '⏱️', color: 'from-purple-500 to-violet-600' },
      ];
    }

    if (mode === 'dns') {
      const dnsResults = results as DNSResult[];
      const successResults = dnsResults.filter((r) => r.status === 'success');
      const bestLatency = successResults.length > 0
        ? Math.min(...successResults.map((r) => r.latency))
        : 0;
      const avgLatency = successResults.length > 0
        ? successResults.reduce((a, b) => a + b.latency, 0) / successResults.length
        : 0;

      return [
        { label: 'سرور DNS', value: `${dnsResults.length}`, icon: '📊', color: 'from-blue-500 to-blue-600', sub: `${successResults.length} موفق` },
        { label: 'سریع‌ترین', value: `${bestLatency.toFixed(1)}ms`, icon: '🏆', color: 'from-green-500 to-emerald-600' },
        { label: 'میانگین', value: `${avgLatency.toFixed(1)}ms`, icon: '📈', color: 'from-amber-500 to-orange-600' },
        { label: 'زمان اسکن', value: scanTime ? `${(scanTime / 1000).toFixed(1)}s` : '-', icon: '⏱️', color: 'from-purple-500 to-violet-600' },
      ];
    }

    const cdnResults = results as CDNResult[];
    const bestSpeed = cdnResults.length > 0
      ? Math.max(...cdnResults.map((r) => r.downloadSpeed))
      : 0;
    const bestTTFB = cdnResults.length > 0
      ? Math.min(...cdnResults.map((r) => r.ttfb))
      : 0;

    return [
      { label: 'تست شده', value: `${cdnResults.length}`, icon: '📊', color: 'from-blue-500 to-blue-600', sub: `${cdnResults.filter(r => r.status === 'fast').length} سریع` },
      { label: 'بیشترین سرعت', value: `${bestSpeed.toFixed(1)} MB/s`, icon: '🏆', color: 'from-green-500 to-emerald-600' },
      { label: 'بهترین TTFB', value: `${bestTTFB.toFixed(1)}ms`, icon: '📈', color: 'from-amber-500 to-orange-600' },
      { label: 'زمان تست', value: scanTime ? `${(scanTime / 1000).toFixed(1)}s` : '-', icon: '⏱️', color: 'from-purple-500 to-violet-600' },
    ];
  };

  const stats = getStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
            style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5 hover:border-slate-600/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${stat.color}`} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
            {stat.sub && <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
