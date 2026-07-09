// Network Scanner Dashboard - Cloudflare Worker
// Serves the built dashboard (via Static Assets) and provides
// real network-testing API endpoints under /api/*.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: Ping endpoint for real latency testing
    if (url.pathname === '/api/ping') {
      const target = url.searchParams.get('ip');
      if (!target) {
        return Response.json({ error: 'IP parameter required' }, { status: 400 });
      }

      const start = Date.now();
      try {
        const resp = await fetch(`https://${target}`, {
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

    // API: DNS resolve endpoint (DNS-over-HTTPS)
    if (url.pathname === '/api/dns') {
      const domain = url.searchParams.get('domain') || 'google.com';
      const dnsServer = url.searchParams.get('server') || '1.1.1.1';

      const start = Date.now();
      try {
        const resp = await fetch(
          `https://${dnsServer}/dns-query?name=${domain}&type=A`,
          {
            headers: { Accept: 'application/dns-json' },
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
        const resp = await fetch(testUrl, { signal: AbortSignal.timeout(10000) });
        const ttfb = Date.now() - start;
        const body = await resp.arrayBuffer();
        const totalTime = Date.now() - start;
        const speedMBps = body.byteLength / (1024 * 1024) / (totalTime / 1000);

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

    // Everything else falls through to the static dashboard build
    return env.ASSETS.fetch(request);
  },
};
