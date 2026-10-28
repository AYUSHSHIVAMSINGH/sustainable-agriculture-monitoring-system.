import React from 'react';

const SECTION_DETAILS = {
  'sensor-monitoring': {
    title: 'Sensor Monitoring Module',
    osConcept: 'I/O Management & Real-Time Data Streams',
    description:
      'This module will interface with real or simulated agricultural sensors (soil moisture, temperature, humidity, and ambient light).',
    osMapping:
      'Demonstrates interrupt handling, asynchronous I/O reading, and buffer queues for incoming telemetry data packets.',
  },
  'cpu-scheduling': {
    title: 'CPU Scheduling Module',
    osConcept: 'Process & Task Scheduling Algorithms',
    description:
      'This module will simulate agricultural tasks (e.g. soil moisture sampling, frost alerts, drone surveillance).',
    osMapping:
      'Demonstrates First-Come First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, and Round Robin (RR) with dynamic turnaround and waiting time analysis.',
  },
  'process-sync': {
    title: 'Process Synchronization Module',
    osConcept: 'Critical Section & Concurrency Control',
    description:
      'This module will manage concurrent access to shared farm equipment such as automated water valves and fertilizer pumps.',
    osMapping:
      'Demonstrates Mutex locks, Counting Semaphores, and solving the Producer-Consumer problem between data loggers and processing threads.',
  },
  'deadlock-management': {
    title: 'Deadlock Management Module',
    osConcept: "Banker's Algorithm & Resource Allocation",
    description:
      'This module will monitor farm zones competing for shared, finite resources (irrigation water pumps, power inverters, chemical injectors).',
    osMapping:
      "Demonstrates Resource Allocation Graphs (RAG), Deadlock Detection, and the Banker's Safe State Algorithm to prevent system paralysis.",
  },
  'memory-management': {
    title: 'Memory Management Module',
    osConcept: 'Virtual Memory & Page Replacement Algorithms',
    description:
      'This module will manage limited edge-device memory buffers while logging high-frequency sensor readings.',
    osMapping:
      'Demonstrates FIFO, Least Recently Used (LRU), and Optimal Page Replacement strategies to minimize page faults during agricultural data caching.',
  },
};

export default function ComingSoon({ sectionId, onBackToDashboard }) {
  const details = SECTION_DETAILS[sectionId] || {
    title: 'Module Under Construction',
    osConcept: 'Operating Systems PBL Integration',
    description: 'This module is being developed as part of the NIET OS PBL curriculum.',
    osMapping: 'Details will be updated once the backend algorithms are plugged in.',
  };

  return (
    <div className="page-container">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <span className="coming-soon-badge">Coming Soon</span>
        <h2>{details.title}</h2>
        <p>{details.description}</p>

        <div className="concept-box">
          <div className="concept-box-title">Operating Systems Concept: {details.osConcept}</div>
          <div className="concept-box-desc">{details.osMapping}</div>
        </div>

        <button type="button" className="btn-retry" onClick={onBackToDashboard}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
