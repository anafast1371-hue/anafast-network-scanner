import { motion } from 'framer-motion';
import { useState } from 'react';

export default function WorkerDeploy() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const workerCode = `// NetScan Pro - Cloudflare Worker
// Deploy this worker on Cloudflare Workers

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve the main page
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // Return the built HTML (upload dist/index.html content as a KV)
      const html = await env.ASSETS.get('index.html');
      return new Response(html, {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
      });
    }

    // API: Ping endpoint for real latency testing
    if (url.pathname === '/api/ping') {
      const target = url.searchParams.get('ip');
      if (!target) {
        return Response.json({ error: 'IP parameter required' }, { status: 400 });
      }
      
      const start = Date.now();
      try {
        const resp = await fetch(\`https://\${target}\`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - start;
        return Response.json({
          ip: target,
          latency,
          status: resp.ok ? 'online' : 'offline',
          statusCode: resp.status,
        });
      } catch (e) {
        return Response.json({
          ip: target,
          latency: Date.now() - start,
          status: 'timeout',
          error: e.message,
        });
      }
    }

    // API: DNS resolve endpoint
    if (url.pathname === '/api/dns') {
      const domain = url.searchParams.get('domain') || 'google.com';
      const dnsServer = url.searchParams.get('server') || '1.1.1.1';
      
      const start = Date.now();
      try {
        const resp = await fetch(
          \`https://\${dnsServer}/dns-query?name=\${domain}&type=A\`,
          {
            headers: { 'Accept': 'application/dns-json' },
            signal: AbortSignal.timeout(5000),
          }
        );
        const latency = Date.now() - start;
        const data = await resp.json();
        return Response.json({
          server: dnsServer,
          domain,
          latency,
          answers: data.Answer || [],
          status: 'success',
        });
      } catch (e) {
        return Response.json({
          server: dnsServer,
          domain,
          latency: Date.now() - start,
          status: 'failed',
          error: e.message,
        });
      }
    }

    // API: CDN speed test
    if (url.pathname === '/api/cdn-test') {
      const testUrl = url.searchParams.get('url');
      if (!testUrl) {
        return Response.json({ error: 'URL required' }, { status: 400 });
      }
      
      const start = Date.now();
      try {
        const resp = await fetch(testUrl, {
          signal: AbortSignal.timeout(10000),
        });
        const ttfb = Date.now() - start;
        const body = await resp.arrayBuffer();
        const totalTime = Date.now() - start;
        const speedMBps = (body.byteLength / (1024 * 1024)) / (totalTime / 1000);
        
        return Response.json({
          url: testUrl,
          ttfb,
          totalTime,
          size: body.byteLength,
          speedMBps: Math.round(speedMBps * 100) / 100,
          status: 'success',
        });
      } catch (e) {
        return Response.json({
          url: testUrl,
          latency: Date.now() - start,
          status: 'failed',
          error: e.message,
        });
      }
    }

    // API: Get Cloudflare IP ranges
    if (url.pathname === '/api/cf-ranges') {
      try {
        const resp = await fetch('https://api.cloudflare.com/client/v4/ips');
        const data = await resp.json();
        return Response.json(data);
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};`;

  const wranglerConfig = `# wrangler.toml
name = "netscan-pro"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[[kv_namespaces]]
binding = "ASSETS"
id = "your-kv-namespace-id"`;

  const deploySteps = `# مراحل نصب روی Cloudflare Workers

# 1. نصب Wrangler CLI
npm install -g wrangler

# 2. لاگین به حساب کلودفلر
wrangler login

# 3. ساخت KV Namespace
wrangler kv:namespace create ASSETS

# 4. بیلد پروژه
npm run build

# 5. آپلود فایل HTML به KV
wrangler kv:key put --namespace-id=YOUR_NS_ID \\
  "index.html" --path=./dist/index.html

# 6. دیپلوی Worker
wrangler deploy`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-orange-500/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">☁️</span>
          <div className="text-right">
            <h3 className="text-sm font-bold text-orange-300">نصب روی Cloudflare Workers</h3>
            <p className="text-xs text-slate-400 mt-0.5">کد Worker و راهنمای دیپلوی</p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-orange-400"
        >
          ▼
        </motion.span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 space-y-4"
        >
          {/* Worker Code */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">📜</span>
                <span className="text-xs text-slate-400 font-mono">worker.js</span>
              </div>
              <button
                onClick={() => handleCopy(workerCode)}
                className="px-3 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
              >
                {copied ? '✓ کپی شد' : '📋 کپی'}
              </button>
            </div>
            <pre className="p-4 text-xs text-slate-300 overflow-x-auto max-h-80 custom-scrollbar" dir="ltr">
              <code>{workerCode}</code>
            </pre>
          </div>

          {/* Wrangler Config */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <span className="text-xs text-slate-400 font-mono">wrangler.toml</span>
              </div>
              <button
                onClick={() => handleCopy(wranglerConfig)}
                className="px-3 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
              >
                📋 کپی
              </button>
            </div>
            <pre className="p-4 text-xs text-slate-300 overflow-x-auto" dir="ltr">
              <code>{wranglerConfig}</code>
            </pre>
          </div>

          {/* Deploy Steps */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">🚀</span>
                <span className="text-xs text-slate-400">مراحل دیپلوی</span>
              </div>
              <button
                onClick={() => handleCopy(deploySteps)}
                className="px-3 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
              >
                📋 کپی
              </button>
            </div>
            <pre className="p-4 text-xs text-green-400 overflow-x-auto" dir="ltr">
              <code>{deploySteps}</code>
            </pre>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <span className="text-2xl">🌍</span>
              <h4 className="text-sm font-bold text-white mt-2">Edge Network</h4>
              <p className="text-xs text-slate-400 mt-1">اجرا در بیش از 300 دیتاسنتر در سراسر جهان</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <span className="text-2xl">⚡</span>
              <h4 className="text-sm font-bold text-white mt-2">سرعت بالا</h4>
              <p className="text-xs text-slate-400 mt-1">Cold Start کمتر از 5ms و پردازش سریع</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <span className="text-2xl">🆓</span>
              <h4 className="text-sm font-bold text-white mt-2">رایگان</h4>
              <p className="text-xs text-slate-400 mt-1">100,000 درخواست رایگان در روز</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
