import React, { useState } from 'react';
import {
  createInitialState,
  validateCapacity,
  produceItem,
  consumeItem,
  resetBuffer,
} from '../utils/boundedBufferSimulator';

export default function ProcessSynchronization() {
  const [simState, setSimState] = useState(() => createInitialState(5));
  const [capacityInput, setCapacityInput] = useState(5);
  const [capacityError, setCapacityError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);

  // Handle changing buffer capacity
  const handleApplyCapacity = (e) => {
    e.preventDefault();
    const val = validateCapacity(capacityInput);
    if (!val.valid) {
      setCapacityError(val.error);
      return;
    }
    setCapacityError(null);
    const updated = resetBuffer(simState, val.capacity);
    setSimState(updated);
    setActiveMessage({
      type: 'info',
      text: `Buffer capacity updated to N = ${val.capacity}. Buffer reset to empty state.`,
    });
  };

  // Handle Produce action with visual critical section step
  const handleProduce = () => {
    if (isProcessing) return;
    setActiveMessage(null);

    // 1. Check if buffer is already full (wait(empty) fails)
    if (simState.semaphores.empty <= 0 || simState.buffer.length >= simState.capacity) {
      const res = produceItem(simState);
      setSimState(res.newState);
      setActiveMessage({
        type: 'error',
        text: 'PRODUCER SUSPENDED: wait(empty) blocked because empty == 0 (Buffer is Full). Overwriting would cause data loss!',
      });
      return;
    }

    // 2. Visually demonstrate Mutual Exclusion entering Critical Section
    setIsProcessing(true);
    setSimState((prev) => ({
      ...prev,
      semaphores: { ...prev.semaphores, mutex: 0 },
      isInCriticalSection: true,
      activeActor: 'PRODUCER',
    }));

    setTimeout(() => {
      const res = produceItem(simState);
      setSimState({
        ...res.newState,
        isInCriticalSection: false,
        activeActor: null,
      });
      setIsProcessing(false);
      setActiveMessage({
        type: 'success',
        text: `Producer appended ${res.item.id} to buffer slot ${res.newState.buffer.length - 1}. signal(mutex) unlocked critical section, signal(full) updated.`,
      });
    }, 450);
  };

  // Handle Consume action with visual critical section step
  const handleConsume = () => {
    if (isProcessing) return;
    setActiveMessage(null);

    // 1. Check if buffer is empty (wait(full) fails)
    if (simState.semaphores.full <= 0 || simState.buffer.length === 0) {
      const res = consumeItem(simState);
      setSimState(res.newState);
      setActiveMessage({
        type: 'error',
        text: 'CONSUMER SUSPENDED: wait(full) blocked because full == 0 (Buffer is Empty). Consuming now would cause buffer underflow!',
      });
      return;
    }

    // 2. Visually demonstrate Mutual Exclusion entering Critical Section
    setIsProcessing(true);
    setSimState((prev) => ({
      ...prev,
      semaphores: { ...prev.semaphores, mutex: 0 },
      isInCriticalSection: true,
      activeActor: 'CONSUMER',
    }));

    setTimeout(() => {
      const res = consumeItem(simState);
      setSimState({
        ...res.newState,
        isInCriticalSection: false,
        activeActor: null,
      });
      setIsProcessing(false);
      setActiveMessage({
        type: 'success',
        text: `Consumer removed ${res.item.id} from head slot. signal(mutex) unlocked critical section, signal(empty) updated.`,
      });
    }, 450);
  };

  // Reset buffer completely
  const handleReset = () => {
    const updated = resetBuffer(simState, simState.capacity);
    setSimState(updated);
    setActiveMessage({
      type: 'info',
      text: 'Bounded buffer reset to empty state. Semaphores reinitialized.',
    });
  };

  const percentUsed = Math.round((simState.buffer.length / simState.capacity) * 100);

  return (
    <div className="page-container">
      {/* Educational Header */}
      <div className="hero-card">
        <div className="hero-tag">
          <span>🔒 Operating Systems PBL • Concurrency & Synchronization</span>
        </div>
        <h2 className="hero-title">Process Synchronization: Bounded-Buffer Simulator</h2>
        <p className="hero-subtitle">
          An interactive demonstration of the classical <strong>Producer–Consumer Problem</strong> using Dijkstra's
          counting and binary semaphores (<code>mutex</code>, <code>empty</code>, and <code>full</code>).
          Observe how mutual exclusion prevents race conditions when shared telemetry buffers are accessed.
        </p>
      </div>

      {/* Academic Disclaimer Notice */}
      <div className="sim-banner" style={{ background: '#f8fafc', borderColor: '#cbd5e1', borderLeftColor: '#0284c7' }}>
        <div className="sim-banner-icon" style={{ color: '#0284c7' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <div className="sim-banner-title" style={{ color: '#0f172a' }}>Teaching Simulation Notice</div>
          <div className="sim-banner-text">
            This module is an interactive academic simulation of synchronization primitives (Semaphores & Mutex).
            It represents synchronization algorithms conceptually and does not spawn actual OS kernel threads.
          </div>
        </div>
      </div>

      {/* Semaphore Theory Cards */}
      <h3 className="section-heading">1. Classical Semaphore Primitives</h3>
      <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Semaphore: Mutex */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Binary Semaphore (mutex)</span>
            <div
              className="metric-icon-box"
              style={{
                backgroundColor: simState.semaphores.mutex === 1 ? '#e8f5e9' : '#fee2e2',
                color: simState.semaphores.mutex === 1 ? '#2e7d32' : '#dc2626',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          <div className="metric-value-display">
            <span className="metric-num" style={{ color: simState.semaphores.mutex === 1 ? '#2e7d32' : '#dc2626' }}>
              {simState.semaphores.mutex}
            </span>
            <span className="metric-unit">
              {simState.semaphores.mutex === 1 ? '(Unlocked / Free)' : '(Locked / In CS)'}
            </span>
          </div>
          <div className="metric-timestamp">
            <strong>Mutual Exclusion:</strong> Guarantees only 1 process can modify the buffer at any instant.
          </div>
        </div>

        {/* Semaphore: Empty */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Counting Semaphore (empty)</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </div>
          </div>
          <div className="metric-value-display">
            <span className="metric-num">{simState.semaphores.empty}</span>
            <span className="metric-unit">slots left</span>
          </div>
          <div className="metric-timestamp">
            <strong>wait(empty):</strong> Producer decrements; blocks if empty == 0 (buffer full).
          </div>
        </div>

        {/* Semaphore: Full */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-title">Counting Semaphore (full)</span>
            <div className="metric-icon-box" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
          </div>
          <div className="metric-value-display">
            <span className="metric-num">{simState.semaphores.full}</span>
            <span className="metric-unit">items filled</span>
          </div>
          <div className="metric-timestamp">
            <strong>wait(full):</strong> Consumer decrements; blocks if full == 0 (buffer empty).
          </div>
        </div>
      </div>

      {/* Interactive Controls & Capacity Settings */}
      <div className="actions-toolbar" style={{ marginBottom: '1.5rem' }}>
        <div className="toolbar-info">
          <h3>2. Interactive Synchronization Controls</h3>
          <p>
            Trigger Producer and Consumer processes or configure bounded-buffer capacity ($N$).
          </p>
        </div>

        {/* Capacity Input */}
        <form onSubmit={handleApplyCapacity} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="capacity-input" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Capacity (N):
          </label>
          <input
            id="capacity-input"
            type="number"
            min="1"
            max="20"
            value={capacityInput}
            onChange={(e) => setCapacityInput(e.target.value)}
            disabled={isProcessing}
            style={{
              width: '60px',
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--neutral-border)',
              fontWeight: 700,
              textAlign: 'center',
            }}
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="btn-retry"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
          >
            Apply & Reset
          </button>
        </form>

        {/* Process Triggers */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleProduce}
            disabled={isProcessing}
            className="btn-generate"
            style={{
              background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              opacity: simState.semaphores.empty === 0 ? 0.75 : 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Produce Item</span>
          </button>

          <button
            type="button"
            onClick={handleConsume}
            disabled={isProcessing}
            className="btn-generate"
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              opacity: simState.semaphores.full === 0 ? 0.75 : 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
            </svg>
            <span>Consume Item</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: '1px solid var(--neutral-border)',
              padding: '0.5rem 0.9rem',
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

      {/* Validation or Status Messages */}
      {capacityError && (
        <div className="feedback-alert error">
          <span>{capacityError}</span>
        </div>
      )}

      {activeMessage && (
        <div className={`feedback-alert ${activeMessage.type === 'error' ? 'error' : activeMessage.type === 'success' ? 'success' : 'info'}`}>
          <span>{activeMessage.text}</span>
          <button
            type="button"
            onClick={() => setActiveMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Critical Section Visualizer Box */}
      <div
        className="status-card"
        style={{
          borderLeft: `4px solid ${simState.isInCriticalSection ? '#dc2626' : '#2e7d32'}`,
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Critical Section Status (Mutual Exclusion)
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {simState.isInCriticalSection
                ? `LOCK ACQUIRED: ${simState.activeActor} is executing in the critical section. (mutex = 0)`
                : 'CRITICAL SECTION FREE: No process is currently modifying the shared buffer. (mutex = 1)'}
            </p>
          </div>

          <div
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.8rem',
              backgroundColor: simState.isInCriticalSection ? '#fee2e2' : '#e8f5e9',
              color: simState.isInCriticalSection ? '#dc2626' : '#2e7d32',
              border: `1px solid ${simState.isInCriticalSection ? '#fca5a5' : '#a3d9a5'}`,
            }}
          >
            {simState.isInCriticalSection ? `LOCKED BY ${simState.activeActor}` : 'MUTEX UNLOCKED (FREE)'}
          </div>
        </div>
      </div>

      {/* Visual Bounded Buffer Representation */}
      <div className="data-table-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Bounded-Buffer Visual Representation
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Shared RAM Telemetry Queue • {simState.buffer.length} of {simState.capacity} slots filled ({percentUsed}%)
            </span>
          </div>

          {/* Fill Percentage Indicator */}
          <div style={{ width: '160px', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${percentUsed}%`,
                height: '100%',
                background: percentUsed === 100 ? '#dc2626' : percentUsed > 60 ? '#d97706' : '#2e7d32',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Visual Slots Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`,
            gap: '0.85rem',
            padding: '1rem',
            background: 'var(--neutral-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--neutral-border-light)',
          }}
        >
          {Array.from({ length: simState.capacity }).map((_, idx) => {
            const item = simState.buffer[idx];
            const isHead = idx === 0 && item !== undefined;
            const isTail = idx === simState.buffer.length - 1 && item !== undefined;

            return (
              <div
                key={idx}
                style={{
                  minHeight: '120px',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: item ? '2px solid var(--primary)' : '2px dashed var(--neutral-border)',
                  backgroundColor: item ? '#ffffff' : '#f8faf8',
                  boxShadow: item ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Slot index label */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Slot [{idx}]
                  </span>
                  {isHead && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                      Head (Out)
                    </span>
                  )}
                  {isTail && !isHead && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#e8f5e9', color: '#2e7d32', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                      Tail (In)
                    </span>
                  )}
                </div>

                {/* Slot Contents */}
                {item ? (
                  <div style={{ margin: '0.4rem 0' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      {item.id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      💧 {item.moisture}% moisture
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      🌡️ {item.temperature}°C
                    </div>
                  </div>
                ) : (
                  <div style={{ margin: 'auto 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Empty Slot
                  </div>
                )}

                {/* Bottom status badge */}
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {item ? item.timestamp : 'available'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operation State Transitions History Log */}
      <div className="data-table-card">
        <div className="data-table-header">
          <div>
            <h3>4. Synchronization State Transition History</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Step-by-step audit of semaphore state transitions for each produce/consume operation.
            </p>
          </div>
          <span className="sidebar-footer-badge">
            {simState.history.length} Logged Events
          </span>
        </div>

        <div className="data-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '100px' }}>Time</th>
                <th style={{ width: '130px' }}>Operation</th>
                <th style={{ width: '100px' }}>Actor</th>
                <th style={{ width: '150px' }}>Semaphore Transition</th>
                <th>Detailed OS Explanation</th>
              </tr>
            </thead>
            <tbody>
              {simState.history.map((log) => {
                const isBlocked = log.status === 'BLOCKED';
                const isSuccess = log.status === 'SUCCESS';

                return (
                  <tr key={log.id} style={{ backgroundColor: isBlocked ? '#fff8f8' : undefined }}>
                    <td><strong>{log.id}</strong></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: isBlocked ? '#fee2e2' : isSuccess ? '#e8f5e9' : '#f1f5f9',
                          color: isBlocked ? '#dc2626' : isSuccess ? '#2e7d32' : '#475569',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td><strong>{log.actor}</strong></td>
                    <td style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      empty: {log.beforeState.empty}→{log.afterState.empty}
                      <br />
                      full: {log.beforeState.full}→{log.afterState.full}
                      <br />
                      mutex: {log.beforeState.mutex}→{log.afterState.mutex}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: isBlocked ? '#991b1b' : 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
