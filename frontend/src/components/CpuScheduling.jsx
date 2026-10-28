import React, { useState, useMemo } from 'react';
import {
  runSimulation,
  validateProcesses,
} from '../utils/schedulingAlgorithms';

// Predefined Agricultural Tasks dataset
const DEFAULT_AGRICULTURAL_DATASET = [
  { id: 'P1', name: 'Frost Warning Routine', arrivalTime: 0, burstTime: 5, priority: 1 },
  { id: 'P2', name: 'Soil Moisture Sampling', arrivalTime: 1, burstTime: 3, priority: 3 },
  { id: 'P3', name: 'Irrigation Valve Actuator', arrivalTime: 2, burstTime: 8, priority: 2 },
  { id: 'P4', name: 'Telemetry Cloud Sync', arrivalTime: 3, burstTime: 6, priority: 4 },
];

const ALGORITHM_DESCRIPTIONS = {
  'fcfs': {
    name: 'First Come, First Served (FCFS)',
    type: 'Non-Preemptive',
    desc: 'Processes are scheduled strictly in order of their arrival. Simple, fair, but susceptible to the convoy effect if long tasks arrive first.',
    tieBreak: 'Tie-break: Process ID (natural order).',
  },
  'sjf-non-preemptive': {
    name: 'Shortest Job First (SJF Non-Preemptive)',
    type: 'Non-Preemptive',
    desc: 'Selects the arrived process with the smallest CPU burst time and runs it to completion. Yields optimal average waiting time among non-preemptive algorithms.',
    tieBreak: 'Tie-break: Arrival Time, then Process ID.',
  },
  'sjf-preemptive': {
    name: 'Shortest Remaining Time First (SRTF / Preemptive SJF)',
    type: 'Preemptive',
    desc: 'If a newly arrived process requires less remaining CPU time than the currently running process, the CPU is preempted to run the shorter job.',
    tieBreak: 'Tie-break: Arrival Time, then Process ID.',
  },
  'priority-non-preemptive': {
    name: 'Priority Scheduling (Non-Preemptive)',
    type: 'Non-Preemptive',
    desc: 'Selects the arrived process with highest priority (lowest numeric value) and executes it to completion without interruption.',
    tieBreak: 'Tie-break: Arrival Time, then Process ID.',
  },
  'priority-preemptive': {
    name: 'Priority Scheduling (Preemptive)',
    type: 'Preemptive',
    desc: 'If an incoming process has a higher priority (smaller numeric value) than the currently executing process, the current process is preempted.',
    tieBreak: 'Tie-break: Arrival Time, then Process ID.',
  },
  'round-robin': {
    name: 'Round Robin (RR)',
    type: 'Preemptive',
    desc: 'Each process is assigned a fixed time slice (Time Quantum). When the quantum expires, the process is preempted and placed at the back of the ready queue.',
    tieBreak: 'Newly arrived processes during a slice are queued before the preempted process.',
  },
};

// Color palette for Gantt chart processes (pleasant agricultural & neutral shades)
const PROCESS_COLORS = [
  { bg: '#2e7d32', text: '#ffffff', border: '#1b5e20' }, // Forest Green
  { bg: '#0284c7', text: '#ffffff', border: '#0369a1' }, // Sky Blue
  { bg: '#d97706', text: '#ffffff', border: '#b45309' }, // Amber
  { bg: '#7c3aed', text: '#ffffff', border: '#6d28d9' }, // Purple
  { bg: '#059669', text: '#ffffff', border: '#047857' }, // Emerald
  { bg: '#e11d48', text: '#ffffff', border: '#be123c' }, // Rose
  { bg: '#475569', text: '#ffffff', border: '#334155' }, // Slate
  { bg: '#ca8a04', text: '#ffffff', border: '#a16207' }, // Olive Gold
];

export default function CpuScheduling() {
  const [processes, setProcesses] = useState(DEFAULT_AGRICULTURAL_DATASET);
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [quantum, setQuantum] = useState(2);
  const [nextIdNum, setNextIdNum] = useState(5);

  // Validate inputs
  const validation = useMemo(() => {
    return validateProcesses(processes, quantum, algorithm);
  }, [processes, quantum, algorithm]);

  // Run calculation dynamically
  const simulationResult = useMemo(() => {
    if (!validation.valid) return null;
    try {
      return runSimulation(algorithm, processes, quantum);
    } catch (err) {
      return null;
    }
  }, [algorithm, processes, quantum, validation]);

  // Helper to get color for a process
  const getColorForPid = (pid) => {
    if (pid === 'IDLE') {
      return { bg: '#e2e8f0', text: '#475569', border: '#cbd5e1' };
    }
    const idx = processes.findIndex((p) => p.id === pid);
    if (idx >= 0) {
      return PROCESS_COLORS[idx % PROCESS_COLORS.length];
    }
    return PROCESS_COLORS[0];
  };

  // Process Handlers
  const handleUpdateProcess = (index, field, value) => {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: value };
    setProcesses(updated);
  };

  const handleRemoveProcess = (index) => {
    const updated = processes.filter((_, i) => i !== index);
    setProcesses(updated);
  };

  const handleAddProcess = () => {
    const newProcess = {
      id: `P${nextIdNum}`,
      name: `Agricultural Task P${nextIdNum}`,
      arrivalTime: 0,
      burstTime: 4,
      priority: 2,
    };
    setNextIdNum(nextIdNum + 1);
    setProcesses([...processes, newProcess]);
  };

  const handleLoadExample = () => {
    setProcesses(DEFAULT_AGRICULTURAL_DATASET);
    setNextIdNum(5);
  };

  const handleReset = () => {
    setProcesses([]);
  };

  const currentAlgoInfo = ALGORITHM_DESCRIPTIONS[algorithm];

  return (
    <div className="page-container">
      {/* Intro Header */}
      <div className="hero-card">
        <div className="hero-tag">
          <span>⚙️ Operating Systems PBL • Processor Scheduling Module</span>
        </div>
        <h2 className="hero-title">CPU Scheduling Simulator</h2>
        <p className="hero-subtitle">
          Simulate how the operating system schedules real-time and background agricultural tasks.
          Compare turnaround time, waiting time, and CPU utilization across 6 CPU scheduling algorithms.
        </p>
      </div>

      {/* Algorithm Selection & Configuration Bar */}
      <div className="status-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Select Scheduling Algorithm
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Choose an algorithm to simulate execution intervals and performance metrics.
            </p>
          </div>

          {/* Time Quantum (Only shown for Round Robin) */}
          {algorithm === 'round-robin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--primary-soft)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
              <label htmlFor="quantum-input" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Time Quantum (q):
              </label>
              <input
                id="quantum-input"
                type="number"
                min="1"
                max="100"
                value={quantum}
                onChange={(e) => setQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '60px',
                  padding: '0.25rem 0.4rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--neutral-border)',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              />
            </div>
          )}
        </div>

        {/* Algorithm Selection Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
          {Object.entries(ALGORITHM_DESCRIPTIONS).map(([key, info]) => (
            <button
              key={key}
              type="button"
              onClick={() => setAlgorithm(key)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: algorithm === key ? '2px solid var(--primary)' : '1px solid var(--neutral-border)',
                background: algorithm === key ? 'var(--primary-soft)' : 'var(--neutral-surface)',
                color: algorithm === key ? 'var(--primary-dark)' : 'var(--text-secondary)',
                fontWeight: algorithm === key ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{info.name.split(' ')[0]}</span>
                <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: algorithm === key ? 'var(--primary)' : '#edf2f7', color: algorithm === key ? '#fff' : '#64748b' }}>
                  {info.type.slice(0, 4)}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {info.name}
              </div>
            </button>
          ))}
        </div>

        {/* Algorithm Detail Box */}
        <div style={{ background: '#fafcfa', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {currentAlgoInfo.name} ({currentAlgoInfo.type})
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            {currentAlgoInfo.desc}
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Priority convention: <strong>Lower number = Higher Priority</strong>. {currentAlgoInfo.tieBreak}
          </div>
        </div>
      </div>

      {/* Process Workload Input Table */}
      <div className="data-table-card" style={{ marginBottom: '1.5rem' }}>
        <div className="data-table-header">
          <div>
            <h3>2. Process Workload Configuration</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Define agricultural tasks, arrival times (AT), burst times (BT), and priorities.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-retry"
              onClick={handleLoadExample}
              title="Load pre-configured agricultural dataset"
            >
              <span>Load Example Dataset</span>
            </button>

            <button
              type="button"
              className="btn-retry"
              onClick={handleAddProcess}
              style={{ backgroundColor: 'var(--primary-dark)' }}
            >
              <span>+ Add Process</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: '1px solid var(--neutral-border)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Validation Error Alert */}
        {!validation.valid && (
          <div className="feedback-alert error" style={{ margin: '1rem 1.5rem 0 1.5rem' }}>
            <strong>Input Error:</strong> {validation.error}
          </div>
        )}

        {processes.length === 0 ? (
          <div className="empty-readings-box">
            <h4>No processes in schedule queue</h4>
            <p>
              Click <strong>"Load Example Dataset"</strong> or <strong>"+ Add Process"</strong> above to begin your simulation.
            </p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>PID</th>
                  <th>Task Name</th>
                  <th style={{ width: '130px' }}>Arrival Time (AT)</th>
                  <th style={{ width: '130px' }}>Burst Time (BT)</th>
                  <th style={{ width: '110px' }}>Priority</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={p.id}
                        onChange={(e) => handleUpdateProcess(index, 'id', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                          fontWeight: 700,
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={p.name || ''}
                        onChange={(e) => handleUpdateProcess(index, 'name', e.target.value)}
                        placeholder="e.g. Frost Alert"
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={p.arrivalTime}
                        onChange={(e) =>
                          handleUpdateProcess(index, 'arrivalTime', Math.max(0, parseInt(e.target.value) || 0))
                        }
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={p.burstTime}
                        onChange={(e) =>
                          handleUpdateProcess(index, 'burstTime', Math.max(1, parseInt(e.target.value) || 1))
                        }
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={p.priority}
                        onChange={(e) =>
                          handleUpdateProcess(index, 'priority', Math.max(1, parseInt(e.target.value) || 1))
                        }
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveProcess(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                        title="Remove process"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visualisation: Gantt Chart */}
      {simulationResult && (
        <div className="status-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Execution Timeline (Gantt Chart)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total Duration: <strong>{simulationResult.summary.totalExecutionTime} units</strong>
            </span>
          </div>

          {/* Timeline Bar */}
          <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', minWidth: '600px', height: '52px', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {simulationResult.gantt.map((seg, idx) => {
                const duration = seg.endTime - seg.startTime;
                const total = simulationResult.summary.totalExecutionTime || 1;
                const widthPercent = (duration / total) * 100;
                const colors = getColorForPid(seg.pid);

                return (
                  <div
                    key={idx}
                    style={{
                      flex: `${duration} 0 ${Math.max(40, widthPercent * 6)}px`,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid rgba(255, 255, 255, 0.4)',
                      padding: '0 4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={`${seg.pid} (${seg.name}): ${seg.startTime} → ${seg.endTime} (${duration} units)`}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{seg.pid}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.9 }}>{duration}u</span>
                  </div>
                );
              })}
            </div>

            {/* Time Markers */}
            <div style={{ display: 'flex', minWidth: '600px', marginTop: '0.35rem', position: 'relative' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>0</span>
              {simulationResult.gantt.map((seg, idx) => {
                const duration = seg.endTime - seg.startTime;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: `${duration} 0 0`,
                      textAlign: 'right',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {seg.endTime}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Metrics */}
      {simulationResult && (
        <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="metric-card">
            <span className="metric-title">Avg Turnaround Time</span>
            <div className="metric-value-display">
              <span className="metric-num">{simulationResult.summary.avgTurnaroundTime}</span>
              <span className="metric-unit">units</span>
            </div>
            <div className="metric-timestamp">Formula: TAT = Completion - Arrival</div>
          </div>

          <div className="metric-card">
            <span className="metric-title">Avg Waiting Time</span>
            <div className="metric-value-display">
              <span className="metric-num">{simulationResult.summary.avgWaitingTime}</span>
              <span className="metric-unit">units</span>
            </div>
            <div className="metric-timestamp">Formula: WT = Turnaround - Burst</div>
          </div>

          <div className="metric-card">
            <span className="metric-title">Avg Response Time</span>
            <div className="metric-value-display">
              <span className="metric-num">{simulationResult.summary.avgResponseTime}</span>
              <span className="metric-unit">units</span>
            </div>
            <div className="metric-timestamp">Formula: RT = First Start - Arrival</div>
          </div>

          <div className="metric-card">
            <span className="metric-title">CPU Utilization</span>
            <div className="metric-value-display">
              <span className="metric-num">{simulationResult.summary.cpuUtilization}</span>
              <span className="metric-unit">%</span>
            </div>
            <div className="metric-timestamp">
              Busy: {simulationResult.summary.busyTime}u | Idle: {simulationResult.summary.idleTime}u
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {simulationResult && (
        <div className="data-table-card">
          <div className="data-table-header">
            <h3>4. Detailed Calculation Results</h3>
            <span className="sidebar-footer-badge">
              {simulationResult.results.length} Processed Tasks
            </span>
          </div>

          <div className="data-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Task Name</th>
                  <th>Arrival (AT)</th>
                  <th>Burst (BT)</th>
                  <th>Priority</th>
                  <th>Completion (CT)</th>
                  <th>Turnaround (TAT)</th>
                  <th>Waiting (WT)</th>
                  <th>Response (RT)</th>
                </tr>
              </thead>
              <tbody>
                {simulationResult.results.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.id}</strong>
                    </td>
                    <td>{r.name}</td>
                    <td>{r.arrivalTime}</td>
                    <td>{r.burstTime}</td>
                    <td>{r.priority}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {r.completionTime}
                      </span>
                    </td>
                    <td>{r.turnaroundTime}</td>
                    <td>{r.waitingTime}</td>
                    <td>{r.responseTime}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8faf8', fontWeight: 700 }}>
                  <td colSpan="6" style={{ textAlign: 'right', padding: '0.9rem 1.25rem' }}>
                    Average Metrics:
                  </td>
                  <td style={{ color: 'var(--primary-dark)', padding: '0.9rem 1.25rem' }}>
                    {simulationResult.summary.avgTurnaroundTime}
                  </td>
                  <td style={{ color: 'var(--primary-dark)', padding: '0.9rem 1.25rem' }}>
                    {simulationResult.summary.avgWaitingTime}
                  </td>
                  <td style={{ color: 'var(--primary-dark)', padding: '0.9rem 1.25rem' }}>
                    {simulationResult.summary.avgResponseTime}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
