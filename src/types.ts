export interface IPRange {
  name: string;
  provider: string;
  ranges: string[];
  icon: string;
}

export interface ScanResult {
  ip: string;
  provider: string;
  latency: number;
  status: 'online' | 'offline' | 'timeout';
  loss: number;
  jitter: number;
  downloadSpeed?: number;
  location?: string;
  timestamp: number;
}

export interface DNSResult {
  server: string;
  provider: string;
  ip: string;
  latency: number;
  status: 'success' | 'failed' | 'timeout';
  reliability: number;
  timestamp: number;
}

export interface CDNResult {
  provider: string;
  url: string;
  latency: number;
  downloadSpeed: number;
  ttfb: number;
  status: 'fast' | 'medium' | 'slow';
  location?: string;
  timestamp: number;
}

export type ScanMode = 'ip' | 'dns' | 'cdn';
export type ScanStatus = 'idle' | 'scanning' | 'completed' | 'error';

export interface ScanState {
  mode: ScanMode;
  status: ScanStatus;
  progress: number;
  results: ScanResult[] | DNSResult[] | CDNResult[];
  startTime?: number;
  endTime?: number;
}
