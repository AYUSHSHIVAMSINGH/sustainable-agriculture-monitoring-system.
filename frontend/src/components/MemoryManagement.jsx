import React, { useState, useMemo } from 'react';
import {
  validateMemoryInputs,
  simulateFirstFit,
  simulateBestFit,
  simulateWorstFit,
  compareAllAlgorithms,
} from '../utils/memoryAlgorithms';

// Standard agricultural IoT telemetry gateway partitions & process workload
const DEFAULT_BLOCKS = [
  { id: 'B1', name: 'Gateway Cache 1', size: 100 },
  { id: 'B2', name: 'Gateway Cache 2', size: 500 },
  { id: 'B3', name: 'Gateway Cache 3', size: 200 },
  { id: 'B4', name: 'Gateway Cache 4', size: 300 },
  { id: 'B5', name: 'Gateway Cache 5', size: 600 },
];

const DEFAULT_PROCESSES = [
  { id: 'P1', name: 'Soil Telemetry Buffer', size: 212 },
  { id: 'P2', name: 'Drone Imagery Stream', size: 417 },
  { id: 'P3', name: 'Weather Station Logger', size: 112 },
  { id: 'P4', name: 'Irrigation Map Tensor', size: 426 },
];

export default function MemoryManagement() {
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);
  const [selectedAlgo, setSelectedAlgo] = useState('first-fit'); // 'first-fit' | 'best-fit' | 'worst-fit' | 'compare'
  const [nextBlockNum, setNextBlockNum] = useState(6);
  const [nextProcNum, setNextProcNum] = useState(5);

  // Validate inputs
  const validation = useMemo(() => {
    return validateMemoryInputs(blocks, processes);
  }, [blocks, processes]);

  // Run simulation based on current inputs
  const simResult = useMemo(() => {
    if (!validation.valid) return null;
    if (selectedAlgo === 'first-fit') return simulateFirstFit(blocks, processes);
    if (selectedAlgo === 'best-fit') return simulateBestFit(blocks, processes);
    if (selectedAlgo === 'worst-fit') return simulateWorstFit(blocks, processes);
    return null;
  }, [blocks, processes, selectedAlgo, validation]);

  // Run comparison of all 3 algorithms
  const comparisonResults = useMemo(() => {
    if (!validation.valid) return null;
    return compareAllAlgorithms(blocks, processes);
  }, [blocks, processes, validation]);

  // Handlers for Blocks
  const handleUpdateBlock = (index, field, value) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    setBlocks(updated);
  };

  const handleAddBlock = () => {
    const newB = { id: `B${nextBlockNum}`, name: `Partition B${nextBlockNum}`, size: 250 };
    setNextBlockNum(nextBlockNum + 1);
    setBlocks([...blocks, newB]);
  };

  const handleRemoveBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  // Handlers for Processes
  const handleUpdateProcess = (index, field, value) => {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: value };
    setProcesses(updated);
  };

  const handleAddProcess = () => {
    const newP = { id: `P${nextProcNum}`, name: `Task P${nextProcNum}`, size: 150 };
    setNextProcNum(nextProcNum + 1);
    setProcesses([...processes, newP]);
  };

  const handleRemoveProcess = (index) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const handleLoadExample = () => {
    setBlocks(DEFAULT_BLOCKS);
    setProcesses(DEFAULT_PROCESSES);
    setNextBlockNum(6);
    setNextProcNum(5);
  };

  const handleReset = () => {
    setBlocks([]);
    setProcesses([]);
  };

  return (
    <div className="page-container">
      {/* Intro Hero */}
      <div className="hero-card">
        <div className="hero-tag">
          <span>🧠 Operating Systems PBL • Contiguous Memory Management</span>
        </div>
        <h2 className="hero-title">Memory Allocation & Fragmentation Simulator</h2>
        <p className="hero-subtitle">
          Simulate how an operating system allocates physical memory partitions to agricultural processes using{' '}
          <strong>First Fit</strong>, <strong>Best Fit</strong>, and <strong>Worst Fit</strong>. Analyze how allocation decisions
          influence <em>Internal Fragmentation</em> and prevent tasks from running.
        </p>
      </div>

      {/* Model Assumptions Banner */}
      <div className="sim-banner" style={{ background: '#f8fafc', borderColor: '#cbd5e1', borderLeftColor: '#0284c7' }}>
        <div className="sim-banner-icon" style={{ color: '#0284c7' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <div className="sim-banner-title" style={{ color: '#0f172a' }}>Fixed Partition Model Assumptions</div>
          <div className="sim-banner-text">
            Each memory block is a fixed-size partition hosting at most one process.
            Unused space remaining <em>inside</em> an allocated partition is <strong>Internal Fragmentation</strong>.
            Unoccupied partitions remain <strong>Free Memory</strong>.
          </div>
        </div>
      </div>

      {/* Algorithm Selector Bar */}
      <div className="actions-toolbar" style={{ marginBottom: '1.5rem' }}>
        <div className="toolbar-info">
          <h3>1. Select Allocation Algorithm</h3>
          <p>Choose an algorithm or compare all three side by side on your custom workload.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            { id: 'first-fit', label: 'First Fit' },
            { id: 'best-fit', label: 'Best Fit' },
            { id: 'worst-fit', label: 'Worst Fit' },
            { id: 'compare', label: '📊 Compare All 3' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedAlgo(item.id)}
              className={selectedAlgo === item.id ? 'btn-generate' : 'btn-retry'}
              style={{
                background: selectedAlgo === item.id ? undefined : 'var(--neutral-surface)',
                color: selectedAlgo === item.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--neutral-border)',
                fontWeight: selectedAlgo === item.id ? 700 : 500,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workload Inputs: Blocks & Processes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Panel A: Memory Blocks */}
        <div className="data-table-card">
          <div className="data-table-header">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Available Memory Partitions</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RAM blocks available for allocation</span>
            </div>
            <button type="button" className="btn-retry" onClick={handleAddBlock} style={{ fontSize: '0.78rem' }}>
              + Add Block
            </button>
          </div>

          <div className="data-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Block ID</th>
                  <th>Partition Label</th>
                  <th style={{ width: '110px' }}>Size (KB)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        value={b.id}
                        onChange={(e) => handleUpdateBlock(idx, 'id', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                          fontWeight: 700,
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={b.name || ''}
                        onChange={(e) => handleUpdateBlock(idx, 'name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={b.size}
                        onChange={(e) =>
                          handleUpdateBlock(idx, 'size', Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                          fontWeight: 600,
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(idx)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel B: Process Requests */}
        <div className="data-table-card">
          <div className="data-table-header">
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Process Memory Requests</h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order of memory requests</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" className="btn-retry" onClick={handleLoadExample} style={{ fontSize: '0.78rem' }}>
                Load Example
              </button>
              <button type="button" className="btn-retry" onClick={handleAddProcess} style={{ fontSize: '0.78rem' }}>
                + Add Task
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.6rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="data-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>PID</th>
                  <th>Task Name</th>
                  <th style={{ width: '110px' }}>Request (KB)</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((p, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        value={p.id}
                        onChange={(e) => handleUpdateProcess(idx, 'id', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.4rem',
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
                        onChange={(e) => handleUpdateProcess(idx, 'name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={p.size}
                        onChange={(e) =>
                          handleUpdateProcess(idx, 'size', Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        style={{
                          width: '100%',
                          padding: '0.25rem 0.4rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--neutral-border)',
                          fontWeight: 600,
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveProcess(idx)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Validation Alert */}
      {!validation.valid && (
        <div className="feedback-alert error" style={{ marginBottom: '1.5rem' }}>
          <strong>Configuration Error:</strong> {validation.error}
        </div>
      )}

      {/* ========================================================
          SINGLE ALGORITHM VIEW
          ======================================================== */}
      {selectedAlgo !== 'compare' && simResult && (
        <>
          {/* KPI Metrics Summary Cards */}
          <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="metric-card">
              <span className="metric-title">Total Partition Memory</span>
              <div className="metric-value-display">
                <span className="metric-num">{simResult.metrics.totalMemory}</span>
                <span className="metric-unit">KB</span>
              </div>
              <div className="metric-timestamp">Sum of all {blocks.length} configured block capacities</div>
            </div>

            <div className="metric-card">
              <span className="metric-title">Allocated Process Memory</span>
              <div className="metric-value-display">
                <span className="metric-num" style={{ color: 'var(--primary)' }}>
                  {simResult.metrics.allocatedMemory}
                </span>
                <span className="metric-unit">KB</span>
              </div>
              <div className="metric-timestamp">
                Utilization: {simResult.metrics.memoryUtilization}% ({simResult.metrics.allocatedCount}/{processes.length} tasks)
              </div>
            </div>

            <div className="metric-card">
              <span className="metric-title">Internal Fragmentation</span>
              <div className="metric-value-display">
                <span className="metric-num" style={{ color: '#d97706' }}>
                  {simResult.metrics.internalFragmentation}
                </span>
                <span className="metric-unit">KB</span>
              </div>
              <div className="metric-timestamp">Unused space inside allocated partitions</div>
            </div>

            <div className="metric-card">
              <span className="metric-title">Unused Whole Blocks</span>
              <div className="metric-value-display">
                <span className="metric-num">{simResult.metrics.unallocatedFreeMemory}</span>
                <span className="metric-unit">KB</span>
              </div>
              <div className="metric-timestamp">Free space in completely unoccupied blocks</div>
            </div>
          </div>

          {/* External Fragmentation Warning if Applicable */}
          {simResult.metrics.hasExternalFragmentation && (
            <div className="feedback-alert error" style={{ marginBottom: '1.5rem' }}>
              <strong>⚠️ External Fragmentation Detected:</strong> The system has{' '}
              {simResult.metrics.unallocatedFreeMemory} KB of free memory across unused blocks, but process(es){' '}
              {simResult.metrics.externalFragmentationVictims.join(', ')} cannot be allocated because no single
              contiguous block is large enough!
            </div>
          )}

          {/* Visual Memory Blocks Diagram */}
          <div className="data-table-card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Physical Memory Blocks Diagram</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Visual mapping of tasks to memory partitions under {selectedAlgo.toUpperCase().replace('-', ' ')}
                </span>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }}></span>
                  Allocated Task
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fef3c7', border: '1px dashed #d97706' }}></span>
                  Internal Fragmentation
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}></span>
                  Unallocated Block
                </span>
              </div>
            </div>

            {/* Blocks Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {simResult.blocks.map((b) => {
                const isOccupied = b.isAllocated;
                const proc = b.allocatedProcess;
                const allocPercent = isOccupied ? Math.round((proc.size / b.initialSize) * 100) : 0;
                const fragPercent = isOccupied ? 100 - allocPercent : 0;

                return (
                  <div
                    key={b.id}
                    style={{
                      border: isOccupied ? '2px solid var(--primary-border)' : '2px dashed var(--neutral-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      background: isOccupied ? '#ffffff' : '#f8fafc',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {b.id} ({b.initialSize} KB)
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: isOccupied ? '#e8f5e9' : '#f1f5f9',
                          color: isOccupied ? '#2e7d32' : '#64748b',
                        }}
                      >
                        {isOccupied ? 'OCCUPIED' : 'FREE BLOCK'}
                      </span>
                    </div>

                    {/* Progress Bar of Partition Usage */}
                    <div style={{ width: '100%', height: '16px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '0.6rem' }}>
                      {isOccupied && (
                        <>
                          <div
                            style={{
                              width: `${allocPercent}%`,
                              background: 'var(--primary)',
                              title: `Process: ${proc.size} KB`,
                            }}
                          />
                          <div
                            style={{
                              width: `${fragPercent}%`,
                              background: '#fef3c7',
                              borderLeft: '1px solid #d97706',
                              title: `Internal Frag: ${b.internalFragmentation} KB`,
                            }}
                          />
                        </>
                      )}
                    </div>

                    {isOccupied ? (
                      <div style={{ fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                          {proc.id}: {proc.name}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Used: <strong>{proc.size} KB</strong> ({allocPercent}%)
                        </div>
                        <div style={{ color: '#b45309', marginTop: '0.1rem', fontSize: '0.75rem' }}>
                          Internal Frag: <strong>{b.internalFragmentation} KB</strong> ({fragPercent}%)
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                        Entire partition ({b.initialSize} KB) available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Unallocated Processes Alert */}
            {simResult.processes.some((p) => !p.allocated) && (
              <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Unallocated Tasks (Failed to Fit into any Free Block):
                </span>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {simResult.processes
                    .filter((p) => !p.allocated)
                    .map((p) => (
                      <span
                        key={p.id}
                        style={{
                          background: '#fff',
                          border: '1px solid #f87171',
                          color: '#dc2626',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}
                      >
                        {p.id} ({p.size} KB) — {p.name}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Allocation Log */}
          <div className="data-table-card">
            <div className="data-table-header">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Step-by-Step Allocation Trace</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Detailed audit explaining why each block was chosen or rejected
                </span>
              </div>
              <span className="sidebar-footer-badge">
                {simResult.steps.length} Allocation Requests
              </span>
            </div>

            <div className="data-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Step</th>
                    <th>Process</th>
                    <th>Request</th>
                    <th>Status</th>
                    <th>Assigned Block</th>
                    <th>Internal Frag</th>
                    <th>OS Reasoning</th>
                  </tr>
                </thead>
                <tbody>
                  {simResult.steps.map((st) => (
                    <tr key={st.step} style={{ backgroundColor: st.status === 'FAILED' ? '#fff8f8' : undefined }}>
                      <td><strong>#{st.step}</strong></td>
                      <td>
                        <strong style={{ color: 'var(--primary-dark)' }}>{st.processId}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.processName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{st.processSize} KB</td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: st.status === 'ALLOCATED' ? '#e8f5e9' : '#fee2e2',
                            color: st.status === 'ALLOCATED' ? '#2e7d32' : '#dc2626',
                          }}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td>
                        {st.blockId ? (
                          <strong>
                            {st.blockId} ({st.blockSize} KB)
                          </strong>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {st.internalFragmentation !== null ? (
                          <span style={{ color: '#b45309', fontWeight: 600 }}>
                            {st.internalFragmentation} KB
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: st.status === 'FAILED' ? '#991b1b' : 'var(--text-secondary)' }}>
                        {st.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          ALGORITHM COMPARISON VIEW
          ======================================================== */}
      {selectedAlgo === 'compare' && comparisonResults && (
        <div className="data-table-card" style={{ marginBottom: '1.75rem' }}>
          <div className="data-table-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Algorithm Performance Comparison (First Fit vs. Best Fit vs. Worst Fit)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Evaluated against the identical set of memory partitions and process requests.
              </p>
            </div>
          </div>

          <div className="data-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Allocated Tasks</th>
                  <th>Unallocated Tasks</th>
                  <th>Allocated Memory</th>
                  <th>Internal Fragmentation</th>
                  <th>Unused Free Blocks</th>
                  <th>Memory Utilization</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'First Fit', data: comparisonResults.firstFit },
                  { name: 'Best Fit', data: comparisonResults.bestFit },
                  { name: 'Worst Fit', data: comparisonResults.worstFit },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: 'var(--primary-dark)', fontSize: '0.92rem' }}>
                        {row.name}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {row.data.metrics.allocatedCount} / {processes.length}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: row.data.metrics.unallocatedCount > 0 ? '#dc2626' : 'var(--text-muted)',
                        }}
                      >
                        {row.data.metrics.unallocatedCount}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.data.metrics.allocatedMemory} KB</td>
                    <td style={{ fontWeight: 600, color: '#b45309' }}>
                      {row.data.metrics.internalFragmentation} KB
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.data.metrics.unallocatedFreeMemory} KB</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {row.data.metrics.memoryUtilization}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', background: '#fafbfa', borderTop: '1px solid var(--neutral-border-light)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
              💡 Comparative Observation:
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              In the classical textbook workload (partitions: 100, 500, 200, 300, 600 KB; requests: 212, 417, 112, 426 KB),{' '}
              <strong>Best Fit</strong> is the only strategy that successfully allocates all 4 processes. Both{' '}
              <strong>First Fit</strong> and <strong>Worst Fit</strong> allocate the 212 KB and 417 KB tasks to larger partitions prematurely, leaving the 426 KB task unallocated.
            </p>
          </div>
        </div>
      )}

      {/* Educational Viva Guide: Internal vs. External Fragmentation */}
      <div className="status-card" style={{ marginTop: '2rem', padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.75rem' }}>
          OS Viva Reference: Understanding Memory Fragmentation
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#fafbfa', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
              1. Internal Fragmentation
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Occurs when memory is allocated in fixed-size blocks. If a process requires less space than the block size,
              the difference $(B - P)$ remains inside the allocated block and cannot be used by any other task.
            </p>
          </div>

          <div style={{ background: '#fafbfa', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-border)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              2. External Fragmentation
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Occurs when there is enough total free memory across all unallocated blocks to satisfy a request, but the memory
              is non-contiguous (scattered in separate partitions), preventing the process from loading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
