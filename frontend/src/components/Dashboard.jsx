import React, { useState, useEffect, useCallback } from 'react';

export default function Dashboard() {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

  // Backend Health State: 'loading' | 'connected' | 'error'
  const [connectionState, setConnectionState] = useState('loading');
  const [healthData, setHealthData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastChecked, setLastChecked] = useState(null);

  // Fetch /api/health from the FastAPI backend
  const checkBackendHealth = useCallback(async () => {
    setConnectionState('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${apiBase}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHealthData(data);
      setConnectionState('connected');
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setConnectionState('error');
      setErrorMessage(err.message || 'Unable to reach backend server.');
      setLastChecked(new Date().toLocaleTimeString());
    }
  }, [apiBase]);

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  return (
    <div className="page-container">
      {/* Project Title & Intro Hero */}
      <div className="hero-card">
        <div className="hero-tag">
          <span>🌿 Operating Systems PBL • NIET Greater Noida</span>
        </div>
        <h2 className="hero-title">Sustainable Agriculture Monitoring System</h2>
        <p className="hero-subtitle">
          An integrated smart agricultural monitoring architecture designed to demonstrate core
          Operating System principles—including CPU process scheduling, multi-threaded sensor synchronization,
          deadlock prevention for shared irrigation pumps, and memory management for continuous telemetry streams.
        </p>
      </div>

      {/* Real-time Backend Connection Status Card */}
      <div className="status-card">
        <div className="status-header">
          <div className="status-title-group">
            <span className="status-title">Backend API Connection</span>
            <div className={`status-pill ${connectionState}`}>
              <span className="status-indicator-dot"></span>
              <span>{connectionState}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-retry"
            onClick={checkBackendHealth}
            disabled={connectionState === 'loading'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{connectionState === 'loading' ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* State 1: Loading */}
        {connectionState === 'loading' && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sending request to <code>{apiBase}/api/health</code>...
          </p>
        )}

        {/* State 2: Connected */}
        {connectionState === 'connected' && healthData && (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Successfully connected to the FastAPI service. Live telemetry and process endpoints are accessible.
            </p>
            <div className="status-details-grid">
              <div className="status-detail-item">
                <span className="status-detail-label">Service Name</span>
                <span className="status-detail-value">{healthData.service || 'N/A'}</span>
              </div>
              <div className="status-detail-item">
                <span className="status-detail-label">API Health</span>
                <span className="status-detail-value" style={{ color: 'var(--primary)' }}>
                  {healthData.status?.toUpperCase() || 'HEALTHY'}
                </span>
              </div>
              <div className="status-detail-item">
                <span className="status-detail-label">Environment</span>
                <span className="status-detail-value">{healthData.environment || 'development'}</span>
              </div>
              <div className="status-detail-item">
                <span className="status-detail-label">Last Ping</span>
                <span className="status-detail-value">{lastChecked || 'Just now'}</span>
              </div>
            </div>
          </>
        )}

        {/* State 3: Error */}
        {connectionState === 'error' && (
          <div className="status-error-box">
            <p className="status-error-msg">
              <strong>Connection Failed:</strong> {errorMessage}
            </p>
            <p className="status-error-hint">
              Target endpoint: <code>{apiBase}/api/health</code>. Ensure your FastAPI backend server is running via{' '}
              <code>uvicorn app.main:app --reload --port 8000</code>.
            </p>
          </div>
        )}
      </div>

      {/* System Architecture Overview */}
      <h3 className="section-heading">System Architecture (Separation of Concerns)</h3>
      <div className="cards-grid">
        <div className="info-card">
          <div className="card-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17l6-6-6-6M12 19h8" />
            </svg>
          </div>
          <h3>FastAPI Backend</h3>
          <p>
            Runs asynchronous Python processes handling OS scheduling simulations, telemetry ingestion endpoints,
            and resource state management.
          </p>
          <span className="info-card-badge">REST API • Port 8000</span>
        </div>

        <div className="info-card">
          <div className="card-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <h3>React + Vite Frontend</h3>
          <p>
            Clean responsive dashboard displaying real-time system metrics, process logs, and allowing manual
            interaction with simulated OS algorithms.
          </p>
          <span className="info-card-badge">SPA • Port 5173</span>
        </div>

        <div className="info-card">
          <div className="card-header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </div>
          <h3>SQLite Storage</h3>
          <p>
            Zero-configuration, serverless relational database storing sensor logs, threshold limits, and OS simulation
            execution traces locally.
          </p>
          <span className="info-card-badge">Embedded Relational DB</span>
        </div>
      </div>

      {/* Operating Systems PBL Modules Breakdown */}
      <h3 className="section-heading">Operating Systems PBL Modules Roadmap</h3>
      <div className="cards-grid">
        <div className="info-card">
          <h3>1. CPU Scheduling</h3>
          <p>
            Process prioritization for agricultural tasks (e.g., critical frost alerts vs. routine soil moisture logging)
            using FCFS, SJF, and Round Robin algorithms.
          </p>
        </div>

        <div className="info-card">
          <h3>2. Process Synchronization</h3>
          <p>
            Using Semaphores and Mutex locks to prevent race conditions when multiple sensor threads update shared
            irrigation valve controllers.
          </p>
        </div>

        <div className="info-card">
          <h3>3. Deadlock Management</h3>
          <p>
            Simulating resource contention for limited physical resources (water pumps, fertilizer injectors) and applying
            the Banker's Algorithm for avoidance.
          </p>
        </div>

        <div className="info-card">
          <h3>4. Memory Management</h3>
          <p>
            Demonstrating page replacement algorithms (FIFO, LRU) to manage a limited in-memory buffer of high-frequency
            soil telemetry logs before disk flushing.
          </p>
        </div>
      </div>
    </div>
  );
}
