import React, { useEffect, useState } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';

import type { AuthSession, Sensors, Task } from '../models.js';
import { ApiService } from '../services/ApiService.js';

type Props = { session: AuthSession };
type Screen = 'overview' | 'tasks' | 'sensors';

export function Dashboard({ session }: Props) {
  const [screen, setScreen] = useState<Screen>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sensors, setSensors] = useState<Sensors | null>(null);
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState('1 Overview  2 Tasks  3 Sensors  ↑/↓ Select  R Refresh  Q Quit');
  const { stdout } = useStdout();
  const api = new ApiService();

  const refresh = async () => {
    try {
      const [nextTasks, nextSensors] = await Promise.all([
        api.getTasks(session.idToken),
        api.getSensors(session.idToken),
      ]);
      setTasks(nextTasks);
      setSensors(nextSensors);
      setMessage(`Updated ${new Date().toLocaleTimeString()} • ${stdout.columns ?? 80} columns`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load system data.');
    }
  };

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, []);

  useInput((input, key) => {
    if ((key.ctrl && input === 'c') || input.toLowerCase() === 'q') process.exit(0);
    if (input === '1') setScreen('overview');
    if (input === '2') setScreen('tasks');
    if (input === '3') setScreen('sensors');
    if (input.toLowerCase() === 'r') void refresh();
    if (screen === 'tasks' && key.upArrow) setSelected((value) => Math.max(0, value - 1));
    if (screen === 'tasks' && key.downArrow) setSelected((value) => Math.min(tasks.length - 1, value + 1));
  });

  const width = stdout.columns ?? 80;
  const compact = width < 90;
  return (
    <Box flexDirection="column" padding={1}>
      <Box justifyContent="space-between">
        <Text color="greenBright" bold>FREZNEL AI / LIVE MONITOR</Text>
        <Text color="gray">{session.email}</Text>
      </Box>
      <Text color="gray">{'─'.repeat(Math.max(20, Math.min(width - 2, 120)))}</Text>
      <Box marginTop={1} flexDirection={compact ? 'column' : 'row'}>
        <Box flexDirection="column" width={compact ? undefined : 18} marginRight={compact ? 0 : 2}>
          <Text color="gray">NAVIGATION</Text>
          {(['overview', 'tasks', 'sensors'] as Screen[]).map((item, index) => (
            <Text key={item} color={screen === item ? 'greenBright' : undefined}>
              {screen === item ? '› ' : '  '}{index + 1}. {item}
            </Text>
          ))}
        </Box>
        <Box flexDirection="column" flexGrow={1} marginTop={compact ? 1 : 0}>
          <Text bold>{screen.toUpperCase()}</Text>
          {screen === 'overview' && <Overview sensors={sensors} tasks={tasks} />}
          {screen === 'tasks' && <TaskTable tasks={tasks} selected={selected} />}
          {screen === 'sensors' && <SensorsView sensors={sensors} />}
        </Box>
      </Box>
      <Box marginTop={1}><Text color="yellow">{message}</Text></Box>
    </Box>
  );
}

function Overview({ sensors, tasks }: { sensors: Sensors | null; tasks: Task[] }) {
  return <Box flexDirection="column" marginTop={1}>
    <Text>CPU load: {sensors?.cpuLoadPercent ?? '--'}%   Memory: {sensors?.memoryUsedPercent ?? '--'}%   Processes: {tasks.length}</Text>
    <Text>Uptime: {sensors ? `${Math.floor(sensors.uptimeSeconds / 3600)} hours` : '--'}</Text>
    <Box marginTop={1}><Text color="gray">Top processes</Text></Box>
    <TaskTable tasks={tasks.slice(0, 5)} selected={-1} />
  </Box>;
}

function TaskTable({ tasks, selected }: { tasks: Task[]; selected: number }) {
  return <Box flexDirection="column" marginTop={1}>
    <Text color="gray">PID       PROCESS                         CPU       MEMORY</Text>
    {tasks.length === 0 ? <Text color="gray">No task data available.</Text> : tasks.map((task, index) => (
      <Text key={task.pid} color={index === selected ? 'greenBright' : undefined}>
        {index === selected ? '› ' : '  '}{String(task.pid).padEnd(8)} {task.name.slice(0, 28).padEnd(30)} {`${task.cpuPercent}%`.padEnd(9)} {task.memoryMb} MB
      </Text>
    ))}
  </Box>;
}

function SensorsView({ sensors }: { sensors: Sensors | null }) {
  return <Box flexDirection="column" marginTop={1}>
    <Text>CPU load:       {sensors?.cpuLoadPercent ?? '--'}%</Text>
    <Text>Memory used:    {sensors?.memoryUsedMb ?? '--'} / {sensors?.memoryTotalMb ?? '--'} MB</Text>
    <Text>Load average:   {sensors?.loadAverage.join(' / ') ?? '--'}</Text>
    <Text>Uptime:         {sensors ? `${Math.floor(sensors.uptimeSeconds / 3600)}h ${Math.floor(sensors.uptimeSeconds / 60) % 60}m` : '--'}</Text>
    <Text>Captured:       {sensors?.capturedAt ?? '--'}</Text>
  </Box>;
}
