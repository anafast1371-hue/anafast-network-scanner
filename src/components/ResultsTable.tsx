import { motion, AnimatePresence } from 'framer-motion';
import { ScanResult, DNSResult, CDNResult, ScanMode } from '../types';
import { useState } from 'react';

interface ResultsTableProps {
  mode: ScanMode;
  results: ScanResult[] | DNSResult[] | CDNResult[];
}

type SortField = string;
type SortDir = 'asc' | 'desc';

export default function ResultsTable({ mode, results }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('latency');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 15;

  if (results.length === 0) return null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortDir === 'asc' ? '⬆️' : '⬇️';
  };

  const sortedResults = [...results].sort((a: any, b: any) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const filteredResults = filter
    ? sortedResults.filter((r: any) =>
        Object.values(r).some((v) =>
          String(v).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : sortedResults;

  const totalPages = Math.ceil(filteredResults.length / perPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportCSV = () => {
    let csv = '';
    if (mode === 'ip') {
      csv = 'IP,Provider,Latency,Status,Loss,Jitter,Speed,Location\n';
      (results as ScanResult[]).forEach((r) => {
        csv += `${r.ip},${r.provider},${r.latency},${r.status},${r.loss},${r.jitter},${r.downloadSpeed},${r.location}\n`;
      });
    } else if (mode === 'dns') {
      csv = 'Server,IP,Latency,Status,Reliability\n';
      (results as DNSResult[]).forEach((r) => {
        csv += `${r.server},${r.ip},${r.latency},${r.status},${r.reliability}\n`;
      });
    } else {
      csv = 'Provider,Latency,TTFB,Speed,Status,Location\n';
      (results as CDNResult[]).forEach((r) => {
        csv += `${r.provider},${r.latency},${r.ttfb},${r.downloadSpeed},${r.status},${r.location}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netscan-${mode}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 20) return 'text-green-400';
    if (latency < 50) return 'text-emerald-400';
    if (latency < 100) return 'text-yellow-400';
    if (latency < 200) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      online: 'bg-green-500/20 text-green-400 border-green-500/30',
      offline: 'bg-red-500/20 text-red-400 border-red-500/30',
      timeout: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
      fast: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      slow: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden"
    >
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span> نتایج ({filteredResults.length})
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="جستجو..."
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-48 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-xs text-slate-300 hover:bg-slate-600/50 transition-colors flex items-center gap-1"
          >
            <span>📥</span> CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900/50">
              {mode === 'ip' && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">#</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('ip')}>
                    آی‌پی {getSortIcon('ip')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('provider')}>
                    سرویس {getSortIcon('provider')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>
                    لیتنسی {getSortIcon('latency')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                    وضعیت {getSortIcon('status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white hidden md:table-cell" onClick={() => handleSort('loss')}>
                    پکت لاس {getSortIcon('loss')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white hidden lg:table-cell" onClick={() => handleSort('jitter')}>
                    جیتر {getSortIcon('jitter')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 hidden lg:table-cell">لوکیشن</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">عملیات</th>
                </>
              )}
              {mode === 'dns' && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">#</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('server')}>
                    سرور {getSortIcon('server')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('ip')}>
                    آی‌پی {getSortIcon('ip')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>
                    لیتنسی {getSortIcon('latency')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                    وضعیت {getSortIcon('status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white hidden md:table-cell" onClick={() => handleSort('reliability')}>
                    قابلیت اطمینان {getSortIcon('reliability')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">عملیات</th>
                </>
              )}
              {mode === 'cdn' && (
                <>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">#</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('provider')}>
                    سرویس {getSortIcon('provider')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>
                    لیتنسی {getSortIcon('latency')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('ttfb')}>
                    TTFB {getSortIcon('ttfb')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('downloadSpeed')}>
                    سرعت {getSortIcon('downloadSpeed')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                    وضعیت {getSortIcon('status')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 hidden md:table-cell">لوکیشن</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedResults.map((result: any, index: number) => (
                <motion.tr
                  key={`${result.ip || result.provider}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                >
                  {mode === 'ip' && (
                    <>
                      <td className="px-4 py-3 text-xs text-slate-500">{(currentPage - 1) * perPage + index + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-300">{result.ip}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{result.provider}</td>
                      <td className={`px-4 py-3 text-xs font-bold ${getLatencyColor(result.latency)}`}>
                        {result.latency === 9999 ? 'Timeout' : `${result.latency}ms`}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(result.status)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">{result.loss}%</td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{result.jitter}ms</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{result.location}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(result.ip)}
                          className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400 hover:text-white transition-colors"
                          title="کپی آی‌پی"
                        >
                          📋
                        </button>
                      </td>
                    </>
                  )}
                  {mode === 'dns' && (
                    <>
                      <td className="px-4 py-3 text-xs text-slate-500">{(currentPage - 1) * perPage + index + 1}</td>
                      <td className="px-4 py-3 text-xs text-slate-300 font-medium">{result.server}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-300">{result.ip}</td>
                      <td className={`px-4 py-3 text-xs font-bold ${getLatencyColor(result.latency)}`}>
                        {result.latency === 9999 ? 'Failed' : `${result.latency}ms`}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(result.status)}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">{result.reliability}%</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(result.ip)}
                          className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          📋
                        </button>
                      </td>
                    </>
                  )}
                  {mode === 'cdn' && (
                    <>
                      <td className="px-4 py-3 text-xs text-slate-500">{(currentPage - 1) * perPage + index + 1}</td>
                      <td className="px-4 py-3 text-xs text-slate-300 font-medium">{result.provider}</td>
                      <td className={`px-4 py-3 text-xs font-bold ${getLatencyColor(result.latency)}`}>{result.latency}ms</td>
                      <td className={`px-4 py-3 text-xs font-bold ${getLatencyColor(result.ttfb)}`}>{result.ttfb}ms</td>
                      <td className="px-4 py-3 text-xs text-cyan-400 font-bold">{result.downloadSpeed} MB/s</td>
                      <td className="px-4 py-3">{getStatusBadge(result.status)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{result.location}</td>
                    </>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            صفحه {currentPage} از {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              ◀️ قبلی
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3
                ? i + 1
                : currentPage >= totalPages - 2
                ? totalPages - 4 + i
                : currentPage - 2 + i;
              if (page < 1 || page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              بعدی ▶️
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
