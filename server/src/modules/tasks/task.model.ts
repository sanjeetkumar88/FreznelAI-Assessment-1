export interface SystemTask {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryMb: number;
  status: string;
}
