export interface Task { pid: number; name: string; cpuPercent: number; memoryMb: number; status: string }
export interface Sensors { cpuLoadPercent: number; memoryUsedPercent: number; memoryUsedMb: number; memoryTotalMb: number; uptimeSeconds: number; loadAverage: number[]; capturedAt: string }
