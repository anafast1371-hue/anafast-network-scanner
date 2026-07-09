import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ScanResult, DNSResult, CDNResult, ScanMode } from '../types';

interface ChartsProps {
  mode: ScanMode;
  results: ScanResult[] | DNSResult[] | CDNResult[];
}

const COLORS = [
  '#3B82F6', '#06B6D4', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
  '#F97316', '#6366F1',
];

export default function Charts({ mode, results }: ChartsProps) {
  if (results.length === 0) return null;

  const renderIPCharts = () => {
    const ipResults = results as ScanResult[];

    // Group by provider
    const providerStats = ipResults.reduce((acc, r) => {
      if (!acc[r.provider]) {
        acc[r.provider] = { name: r.provider, latencies: [], losses: [], jitters: [], count: 0, online: 0 };
      }
      acc[r.provider].latencies.push(r.latency);
      acc[r.provider].losses.push(r.loss);
      acc[r.provider].jitters.push(r.jitter);
      acc[r.provider].count++;
      if (r.status === 'online') acc[r.provider].online++;
      return acc;
    }, {} as Record<string, any>);

    const barData = Object.values(providerStats).map((p: any) => ({
      name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
      avgLatency: Math.round(p.latencies.reduce((a: number, b: number) => a + b, 0) / p.latencies.length * 10) / 10,
      minLatency: Math.round(Math.min(...p.latencies.filter((l: number) => l < 9999)) * 10) / 10,
      avgLoss: Math.round(p.losses.reduce((a: number, b: number) => a + b, 0) / p.losses.length * 10) / 10,
    }));

    const statusData = [
      { name: 'آنلاین', value: ipResults.filter(r => r.status === 'online').length },
      { name: 'آفلاین', value: ipResults.filter(r => r.status === 'offline').length },
      { name: 'تایم‌اوت', value: ipResults.filter(r => r.status === 'timeout').length },
    ].filter(d => d.value > 0);

    const radarData = Object.values(providerStats).map((p: any) => {
      const avgLat = p.latencies.reduce((a: number, b: number) => a + b, 0) / p.latencies.length;
      return {
        provider: p.name.length > 8 ? p.name.substring(0, 8) : p.name,
        سرعت: Math.max(0, 100 - avgLat),
        پایداری: (p.online / p.count) * 100,
        جیتر: Math.max(0, 100 - (p.jitters.reduce((a: number, b: number) => a + b, 0) / p.jitters.length) * 2),
      };
    });

    // Latency distribution over time
    const timeData = ipResults
      .filter(r => r.status === 'online')
      .slice(-50)
      .map((r, i) => ({
        index: i,
        latency: r.latency,
        provider: r.provider,
      }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Average Latency Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> مقایسه لیتنسی سرویس‌دهنده‌ها
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Bar dataKey="avgLatency" name="میانگین (ms)" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="minLatency" name="بهترین (ms)" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> وضعیت آی‌پی‌ها
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {statusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10B981', '#EF4444', '#F59E0B'][index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🕸️</span> مقایسه کلی سرویس‌ها
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="provider" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 9 }} />
              <Radar name="سرعت" dataKey="سرعت" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="پایداری" dataKey="پایداری" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
              <Radar name="جیتر" dataKey="جیتر" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Latency Timeline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span> روند لیتنسی
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeData}>
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="index" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Area
                type="monotone"
                dataKey="latency"
                name="لیتنسی (ms)"
                stroke="#3B82F6"
                fill="url(#latencyGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    );
  };

  const renderDNSCharts = () => {
    const dnsResults = results as DNSResult[];
    
    const barData = dnsResults
      .filter(r => r.status === 'success')
      .reduce((acc, r) => {
        const existing = acc.find(a => a.name === r.server);
        if (existing) {
          existing.latency = Math.min(existing.latency, r.latency);
          existing.reliability = Math.max(existing.reliability, r.reliability);
        } else {
          acc.push({ name: r.server, latency: r.latency, reliability: r.reliability });
        }
        return acc;
      }, [] as { name: string; latency: number; reliability: number }[])
      .sort((a, b) => a.latency - b.latency);

    const statusData = [
      { name: 'موفق', value: dnsResults.filter(r => r.status === 'success').length },
      { name: 'ناموفق', value: dnsResults.filter(r => r.status === 'failed').length },
      { name: 'تایم‌اوت', value: dnsResults.filter(r => r.status === 'timeout').length },
    ].filter(d => d.value > 0);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> مقایسه سرعت DNS ها
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} width={90} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Bar dataKey="latency" name="لیتنسی (ms)" radius={[0, 6, 6, 0]}>
                {barData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> وضعیت سرورهای DNS
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {statusData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10B981', '#EF4444', '#F59E0B'][index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    );
  };

  const renderCDNCharts = () => {
    const cdnResults = results as CDNResult[];

    const barData = cdnResults
      .sort((a, b) => a.latency - b.latency)
      .map(r => ({
        name: r.provider.length > 12 ? r.provider.substring(0, 12) + '...' : r.provider,
        latency: r.latency,
        ttfb: r.ttfb,
        speed: r.downloadSpeed,
      }));

    const speedData = [...cdnResults]
      .sort((a, b) => b.downloadSpeed - a.downloadSpeed)
      .map(r => ({
        name: r.provider.length > 12 ? r.provider.substring(0, 12) + '...' : r.provider,
        speed: r.downloadSpeed,
      }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> مقایسه لیتنسی و TTFB
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Bar dataKey="latency" name="لیتنسی (ms)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ttfb" name="TTFB (ms)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sm:p-5"
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span>🚀</span> مقایسه سرعت دانلود (MB/s)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={speedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Bar dataKey="speed" name="سرعت (MB/s)" radius={[0, 6, 6, 0]}>
                {speedData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    );
  };

  return (
    <div>
      {mode === 'ip' && renderIPCharts()}
      {mode === 'dns' && renderDNSCharts()}
      {mode === 'cdn' && renderCDNCharts()}
    </div>
  );
}
