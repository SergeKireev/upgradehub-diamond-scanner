export interface Metric {
  id?: string;
  type: string;
  key: string;
  network: string;
  value: number;
  ts: number;
}
