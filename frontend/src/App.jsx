import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SensorMonitoring from './components/SensorMonitoring';
import CpuScheduling from './components/CpuScheduling';
import ProcessSynchronization from './components/ProcessSynchronization';
import DeadlockManagement from './components/DeadlockManagement';
import MemoryManagement from './components/MemoryManagement';
import ComingSoon from './components/ComingSoon';

export default function App() {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'sensor-monitoring':
        return 'Sensor Monitoring';
      case 'cpu-scheduling':
        return 'CPU Scheduling Simulation';
      case 'process-sync':
        return 'Process Synchronization';
      case 'deadlock-management':
        return 'Deadlock Management';
      case 'memory-management':
        return 'Memory Management';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="app-container">
      {/* Collapsible/Sticky Navigation Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sectionId) => setCurrentSection(sectionId)}
      />

      {/* Main Content Viewport */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header className="top-bar">
          <h2 className="top-bar-title">{getSectionTitle()}</h2>
          <span className="top-bar-badge">NIET OS PBL</span>
        </header>

        {/* Dynamic Section Routing */}
        {currentSection === 'dashboard' ? (
          <Dashboard />
        ) : currentSection === 'sensor-monitoring' ? (
          <SensorMonitoring />
        ) : currentSection === 'cpu-scheduling' ? (
          <CpuScheduling />
        ) : currentSection === 'process-sync' ? (
          <ProcessSynchronization />
        ) : currentSection === 'deadlock-management' ? (
          <DeadlockManagement />
        ) : currentSection === 'memory-management' ? (
          <MemoryManagement />
        ) : (
          <ComingSoon
            sectionId={currentSection}
            onBackToDashboard={() => setCurrentSection('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
