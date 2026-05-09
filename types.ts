export interface StockData {
  isin: string;
  companyName: string;
  high1y: number | string;
  high1yDate: string;
  low1y: number | string;
  low1yDate: string;
}

export interface ScrapeResult extends StockData {
  status: 'success' | 'error';
  errorMessage?: string;
}

export enum ProcessStatus {
  Idle = 'idle',
  Running = 'running',
  Finished = 'finished',
  Stopped = 'stopped',
}