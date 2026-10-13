export interface SensorSnapshot {
  cpuLoadPercent: number;
  memoryUsedPercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  uptimeSeconds: number;
  loadAverage: number[];
  capturedAt: string;
}
