import { useState, useCallback, useRef } from 'react';
import { ScanMode, ScanStatus, ScanResult, DNSResult, CDNResult } from './types';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import ScanControls from './components/ScanControls';
import ResultsTable from './components/ResultsTable';
import Charts from './components/Charts';
import LiveLog from './components/LiveLog';
import BestResults from './components/BestResults';
import WorkerDeploy from './components/WorkerDeploy';
import { scanIPs, scanDNS, scanCDN } from './utils/scanner';
import { ipProviders } from './data/providers';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

function App() {
  const [mode, setMode] = useState<ScanMode>('ip');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [ipResults, setIpResults] = useState<ScanResult[]>([]);
  const [dnsResults, setDnsResults] = useState<DNSResult[]>([]);
  const [cdnResults, setCdnResults] = useState<CDNResult[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    ipProviders.map((p) => p.provider)
  );
  const [ipsPerProvider, setIpsPerProvider] = useState(10);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [scanTime, setScanTime] = useState<number | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table');

  const getTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [...prev.slice(-200), { time: getTime(), message, type }]);
  }, []);

  const getResults = () => {
    if (mode === 'ip') return ipResults;
    if (mode === 'dns') return dnsResults;
    return cdnResults;
  };

  const handleToggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
    );
  };

  const handleStartScan = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('scanning');
    setProgress(0);
    setScanTime(undefined);
    setLogs([]);
    const startTime = Date.now();

    addLog(`شروع اسکن ${mode === 'ip' ? 'آی‌پی' : mode === 'dns' ? 'DNS' : 'CDN'}...`, 'info');

    try {
      if (mode === 'ip') {
        setIpResults([]);
        addLog(`سرویس‌های انتخاب شده: ${selectedProviders.length}`, 'info');
        addLog(`تعداد آی‌پی برای هر سرویس: ${ipsPerProvider}`, 'info');

        await scanIPs(
          selectedProviders,
          ipsPerProvider,
          (prog, result) => {
            setProgress(prog);
            setIpResults((prev) => [...prev, result]);
            if (result.status === 'online' && result.latency < 30) {
              addLog(`🎯 ${result.ip} (${result.provider}) - ${result.latency}ms ⭐`, 'success');
            } else if (result.status === 'timeout') {
              addLog(`⏱️ ${result.ip} (${result.provider}) - Timeout`, 'warning');
            } else {
              addLog(`📡 ${result.ip} (${result.provider}) - ${result.latency}ms`, 'info');
            }
          },
          controller.signal
        );
      } else if (mode === 'dns') {
        setDnsResults([]);
        addLog('شروع اسکن سرورهای DNS...', 'info');

        await scanDNS(
          (prog, result) => {
            setProgress(prog);
            setDnsResults((prev) => [...prev, result]);
            if (result.status === 'success') {
              addLog(`✓ ${result.server} (${result.ip}) - ${result.latency}ms`, 'success');
            } else {
              addLog(`✗ ${result.server} (${result.ip}) - Failed`, 'error');
            }
          },
          controller.signal
        );
      } else {
        setCdnResults([]);
        addLog('شروع تست سرعت CDN...', 'info');

        await scanCDN(
          (prog, result) => {
            setProgress(prog);
            setCdnResults((prev) => [...prev, result]);
            addLog(
              `${result.status === 'fast' ? '🚀' : result.status === 'medium' ? '📡' : '🐢'} ${result.provider} - ${result.latency}ms | ${result.downloadSpeed} MB/s`,
              result.status === 'fast' ? 'success' : result.status === 'medium' ? 'info' : 'warning'
            );
          },
          controller.signal
        );
      }

      const elapsed = Date.now() - startTime;
      setScanTime(elapsed);
      setStatus('completed');
      addLog(`✅ اسکن کامل شد! (${(elapsed / 1000).toFixed(1)}s)`, 'success');
    } catch (err) {
      if (controller.signal.aborted) {
        addLog('⛔ اسکن توسط کاربر متوقف شد.', 'warning');
        setStatus('idle');
      } else {
        addLog(`❌ خطا: ${err}`, 'error');
        setStatus('error');
      }
    }
  }, [mode, selectedProviders, ipsPerProvider, addLog]);

  const handleStopScan = () => {
    abortRef.current?.abort();
    setStatus('idle');
  };

  const handleModeChange = (newMode: ScanMode) => {
    if (status === 'scanning') return;
    setMode(newMode);
    setProgress(0);
    setStatus('idle');
  };

  const currentResults = getResults();

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <Header activeMode={mode} onModeChange={handleModeChange} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards mode={mode} results={currentResults} scanTime={scanTime} />

        {/* Scan Controls + Live Log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScanControls
            mode={mode}
            status={status}
            progress={progress}
            selectedProviders={selectedProviders}
            ipsPerProvider={ipsPerProvider}
            onToggleProvider={handleToggleProvider}
            onIpsPerProviderChange={setIpsPerProvider}
            onStartScan={handleStartScan}
            onStopScan={handleStopScan}
          />
          <LiveLog logs={logs} isScanning={status === 'scanning'} />
        </div>

        {/* Best Results */}
        {currentResults.length > 0 && (
          <BestResults mode={mode} results={currentResults} />
        )}

        {/* View Toggle */}
        {currentResults.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('table')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeView === 'table'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
            >
              <span>📋</span> جدول نتایج
            </button>
            <button
              onClick={() => setActiveView('chart')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeView === 'chart'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
            >
              <span>📊</span> نمودارها
            </button>
          </div>
        )}

        {/* Results Table or Charts */}
        {currentResults.length > 0 && activeView === 'table' && (
          <ResultsTable mode={mode} results={currentResults} />
        )}

        {currentResults.length > 0 && activeView === 'chart' && (
          <Charts mode={mode} results={currentResults} />
        )}

        {/* Worker Deploy */}
        <WorkerDeploy />

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-800/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🛡️</span>
            <span className="text-sm font-bold text-slate-400">NetScan Pro</span>
          </div>
          <p className="text-xs text-slate-600">
            اسکنر حرفه‌ای آی‌پی، DNS و CDN | قابل نصب روی Cloudflare Workers
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Built with React + Tailwind CSS + Recharts
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
