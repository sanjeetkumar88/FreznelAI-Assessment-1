import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { ApiClient } from './services/api';
import type { Sensors, Task } from './types';
import './styles.css';

const api = new ApiClient();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'overview' | 'tasks' | 'sensors'>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sensors, setSensors] = useState<Sensors | null>(null);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    if (!user) return;
    const refresh = async () => {
      try {
        const token = await user.getIdToken();
        const [nextTasks, nextSensors] = await Promise.all([api.get<Task[]>('/tasks', token), api.get<Sensors>('/sensors', token)]);
        setTasks(nextTasks);
        setSensors(nextSensors);
        setError('');
      } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load system data'); }
    };
    void refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, [user]);

  if (!user) return <AuthScreen />;
  return <main className="shell"><aside><div className="brand">F<span>•</span></div><nav>{(['overview', 'tasks', 'sensors'] as const).map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</nav><button className="logout" onClick={() => signOut(auth)}>Sign out</button><small>Live monitor<br />v1.0.0</small></aside><section className="content"><header><div><span className="eyebrow">SYSTEM MONITOR / LIVE</span><h2>{tab}</h2></div><div className="status"><i /> Connected</div></header>{error && <div className="error">{error}</div>}{tab === 'overview' && <Overview sensors={sensors} tasks={tasks} />}{tab === 'tasks' && <TaskTable tasks={tasks} />}{tab === 'sensors' && <SensorPanel sensors={sensors} />}</section></main>;
}

function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Authentication failed');
    }
  };
  return <main className="auth"><section><span className="eyebrow">FREZNEL AI / ASSESSMENT</span><h1>System intelligence<br /><em>at a glance.</em></h1><p>{mode === 'signup' ? 'Create an account to view live telemetry.' : 'Sign in to view live telemetry.'}</p><form onSubmit={submit}><input required type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} /><input required minLength={6} type="password" placeholder="Password (6+ characters)" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="submit">{mode === 'signup' ? 'Create account' : 'Sign in'}</button></form>{message && <div className="error">{message}</div>}<button className="link-button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}</button></section></main>;
}

function Overview({ sensors, tasks }: { sensors: Sensors | null; tasks: Task[] }) {
  return <><div className="cards"><Metric label="CPU load" value={`${sensors?.cpuLoadPercent ?? '--'}%`} /><Metric label="Memory" value={`${sensors?.memoryUsedPercent ?? '--'}%`} /><Metric label="Processes" value={String(tasks.length)} /><Metric label="Uptime" value={sensors ? `${Math.floor(sensors.uptimeSeconds / 3600)}h` : '--'} /></div><div className="panel"><h3>Top processes</h3><TaskTable tasks={tasks.slice(0, 8)} /></div></>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="metric"><span>{label}</span><strong>{value}</strong></div>; }
function TaskTable({ tasks }: { tasks: Task[] }) { return <div className="panel"><h3>Running tasks</h3><table><thead><tr><th>PID</th><th>Process</th><th>CPU</th><th>Memory</th><th>Status</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.pid}><td>{task.pid}</td><td>{task.name}</td><td>{task.cpuPercent}%</td><td>{task.memoryMb} MB</td><td><b className="badge">{task.status}</b></td></tr>)}</tbody></table></div>; }
function SensorPanel({ sensors }: { sensors: Sensors | null }) { return <div className="cards sensor-grid"><Metric label="CPU load" value={`${sensors?.cpuLoadPercent ?? '--'}%`} /><Metric label="Memory used" value={`${sensors?.memoryUsedMb ?? '--'} MB`} /><Metric label="Memory total" value={`${sensors?.memoryTotalMb ?? '--'} MB`} /><Metric label="Load average" value={sensors?.loadAverage.join(' / ') ?? '--'} /></div>; }
