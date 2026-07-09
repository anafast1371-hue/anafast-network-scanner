import { ScanResult, DNSResult, CDNResult } from '../types';
import { ipProviders, dnsProviders, cdnProviders } from '../data/providers';

// Parse CIDR to generate random IPs from the range
function cidrToRandomIPs(cidr: string, count: number): string[] {
  const [base, bits] = cidr.split('/');
  const mask = parseInt(bits);
  const parts = base.split('.').map(Number);
  const baseNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  const hostBits = 32 - mask;
  const maxHosts = Math.pow(2, hostBits);

  const ips: string[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count && i < maxHosts - 2; i++) {
    let offset: number;
    do {
      offset = Math.floor(Math.random() * (maxHosts - 2)) + 1;
    } while (used.has(offset));
    used.add(offset);

    const ipNum = (baseNum >>> 0) + offset;
    const ip = [
      (ipNum >>> 24) & 255,
      (ipNum >>> 16) & 255,
      (ipNum >>> 8) & 255,
      ipNum & 255,
    ].join('.');
    ips.push(ip);
  }

  return ips;
}

// Simulate ping with realistic latency distribution
function simulateLatency(provider: string): { latency: number; loss: number; jitter: number } {
  const providerProfiles: Record<string, { base: number; variance: number; lossRate: number }> = {
    cloudflare: { base: 8, variance: 25, lossRate: 0.02 },
    gcore: { base: 15, variance: 40, lossRate: 0.05 },
    fastly: { base: 12, variance: 30, lossRate: 0.03 },
    aws: { base: 20, variance: 50, lossRate: 0.04 },
    google: { base: 10, variance: 35, lossRate: 0.02 },
    azure: { base: 18, variance: 45, lossRate: 0.04 },
    akamai: { base: 14, variance: 35, lossRate: 0.03 },
    digitalocean: { base: 22, variance: 55, lossRate: 0.06 },
  };

  const profile = providerProfiles[provider] || { base: 25, variance: 60, lossRate: 0.1 };
  const latency = profile.base + Math.random() * profile.variance + (Math.random() > 0.9 ? Math.random() * 100 : 0);
  const loss = Math.random() < profile.lossRate ? Math.random() * 15 : 0;
  const jitter = Math.random() * (latency * 0.3);

  return {
    latency: Math.round(latency * 100) / 100,
    loss: Math.round(loss * 100) / 100,
    jitter: Math.round(jitter * 100) / 100,
  };
}

const locations = [
  'Frankfurt, DE', 'Amsterdam, NL', 'London, UK', 'Paris, FR',
  'New York, US', 'San Jose, US', 'Tokyo, JP', 'Singapore, SG',
  'Sydney, AU', 'São Paulo, BR', 'Mumbai, IN', 'Toronto, CA',
  'Dubai, AE', 'Stockholm, SE', 'Warsaw, PL', 'Istanbul, TR',
];

// IP Scanner
export async function scanIPs(
  selectedProviders: string[],
  ipsPerProvider: number,
  onProgress: (progress: number, result: ScanResult) => void,
  signal?: AbortSignal
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const providers = ipProviders.filter((p) => selectedProviders.includes(p.provider));
  const totalIPs = providers.length * ipsPerProvider;
  let scanned = 0;

  for (const provider of providers) {
    if (signal?.aborted) break;
    const range = provider.ranges[Math.floor(Math.random() * provider.ranges.length)];
    const ips = cidrToRandomIPs(range, ipsPerProvider);

    for (const ip of ips) {
      if (signal?.aborted) break;
      await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));

      const { latency, loss, jitter } = simulateLatency(provider.provider);
      const isTimeout = Math.random() < 0.05;

      const result: ScanResult = {
        ip,
        provider: provider.name,
        latency: isTimeout ? 9999 : latency,
        status: isTimeout ? 'timeout' : loss > 10 ? 'offline' : 'online',
        loss,
        jitter,
        downloadSpeed: isTimeout ? 0 : Math.round((1000 / latency) * 50 * (1 - loss / 100) * 100) / 100,
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: Date.now(),
      };

      results.push(result);
      scanned++;
      onProgress((scanned / totalIPs) * 100, result);
    }
  }

  return results;
}

// DNS Scanner
export async function scanDNS(
  onProgress: (progress: number, result: DNSResult) => void,
  signal?: AbortSignal
): Promise<DNSResult[]> {
  const results: DNSResult[] = [];
  const total = dnsProviders.length * 2;
  let scanned = 0;

  for (const provider of dnsProviders) {
    if (signal?.aborted) break;

    for (const ip of [provider.ip, provider.secondary]) {
      if (signal?.aborted) break;
      await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

      const baseLatency = 5 + Math.random() * 80;
      const isFailed = Math.random() < 0.05;

      const result: DNSResult = {
        server: provider.name,
        provider: provider.name,
        ip,
        latency: isFailed ? 9999 : Math.round(baseLatency * 100) / 100,
        status: isFailed ? 'failed' : baseLatency > 200 ? 'timeout' : 'success',
        reliability: isFailed ? 0 : Math.round((100 - Math.random() * 5) * 100) / 100,
        timestamp: Date.now(),
      };

      results.push(result);
      scanned++;
      onProgress((scanned / total) * 100, result);
    }
  }

  return results;
}

// CDN Scanner
export async function scanCDN(
  onProgress: (progress: number, result: CDNResult) => void,
  signal?: AbortSignal
): Promise<CDNResult[]> {
  const results: CDNResult[] = [];
  const total = cdnProviders.length;
  let scanned = 0;

  for (const provider of cdnProviders) {
    if (signal?.aborted) break;
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 500));

    const ttfb = 10 + Math.random() * 200;
    const latency = ttfb + Math.random() * 100;
    const downloadSpeed = Math.round((10 + Math.random() * 90) * 100) / 100;

    const result: CDNResult = {
      provider: provider.name,
      url: provider.testUrl,
      latency: Math.round(latency * 100) / 100,
      downloadSpeed,
      ttfb: Math.round(ttfb * 100) / 100,
      status: latency < 80 ? 'fast' : latency < 200 ? 'medium' : 'slow',
      location: locations[Math.floor(Math.random() * locations.length)],
      timestamp: Date.now(),
    };

    results.push(result);
    scanned++;
    onProgress((scanned / total) * 100, result);
  }

  return results;
}
