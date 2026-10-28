/**
 * CPU Scheduling Algorithms Utility
 * Sustainable Agriculture Monitoring System - Operating Systems PBL (NIET)
 *
 * Implements 6 classic CPU scheduling algorithms with deterministic tie-breaking:
 * 1. FCFS (First Come, First Served)
 * 2. SJF Non-Preemptive
 * 3. SJF Preemptive (SRTF - Shortest Remaining Time First)
 * 4. Priority Non-Preemptive
 * 5. Priority Preemptive
 * 6. Round Robin (with configurable Time Quantum)
 *
 * Conventions & Rules:
 * - Priority: Lower numeric value indicates higher priority (e.g. 1 is highest priority).
 * - Tie-Breaking:
 *   1. Criteria (Burst Time or Priority)
 *   2. Arrival Time (earlier arrival first)
 *   3. Process ID (natural alphanumeric order, e.g. P1 before P2)
 *
 * Formulas:
 * - Completion Time (CT): Time when process finishes execution.
 * - Turnaround Time (TAT) = CT - Arrival Time (AT)
 * - Waiting Time (WT) = TAT - Burst Time (BT)
 * - Response Time (RT) = First Execution Time - AT
 */

/**
 * Natural comparison for process IDs (e.g. "P1" < "P2" < "P10")
 */
function comparePid(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Validates process list before running algorithms.
 */
export function validateProcesses(processes, quantum = 2, algorithm = 'fcfs') {
  if (!Array.isArray(processes) || processes.length === 0) {
    return { valid: false, error: 'Please add at least one process to simulate.' };
  }

  const ids = new Set();
  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];
    const pid = String(p.id || '').trim();
    if (!pid) {
      return { valid: false, error: `Process at row ${i + 1} is missing a Process ID.` };
    }
    if (ids.has(pid)) {
      return { valid: false, error: `Duplicate Process ID "${pid}". IDs must be unique.` };
    }
    ids.add(pid);

    const at = Number(p.arrivalTime);
    if (isNaN(at) || at < 0) {
      return { valid: false, error: `Process ${pid}: Arrival Time must be >= 0.` };
    }

    const bt = Number(p.burstTime);
    if (isNaN(bt) || bt <= 0) {
      return { valid: false, error: `Process ${pid}: Burst Time must be an integer > 0.` };
    }

    const priority = Number(p.priority);
    if (isNaN(priority) || priority < 1) {
      return { valid: false, error: `Process ${pid}: Priority must be an integer >= 1.` };
    }
  }

  if (algorithm === 'round-robin') {
    const q = Number(quantum);
    if (isNaN(q) || q <= 0) {
      return { valid: false, error: 'Round Robin Time Quantum must be a positive integer (> 0).' };
    }
  }

  return { valid: true, error: null };
}

/**
 * Collapses consecutive identical execution slices into clean Gantt segments.
 */
function compressTimeline(timeline) {
  if (!timeline || timeline.length === 0) return [];

  const segments = [];
  let current = { ...timeline[0] };

  for (let i = 1; i < timeline.length; i++) {
    const item = timeline[i];
    if (item.pid === current.pid && item.isIdle === current.isIdle) {
      current.endTime = item.endTime;
    } else {
      segments.push(current);
      current = { ...item };
    }
  }
  segments.push(current);
  return segments;
}

/**
 * Calculates final process metrics (CT, TAT, WT, RT) and summary averages.
 */
function computeMetrics(processes, rawTimeline, firstStartMap, completionMap) {
  const gantt = compressTimeline(rawTimeline);

  const results = processes.map((p) => {
    const at = Number(p.arrivalTime);
    const bt = Number(p.burstTime);
    const priority = Number(p.priority);
    const ct = completionMap[p.id];
    const firstStart = firstStartMap[p.id] !== undefined ? firstStartMap[p.id] : at;

    const tat = ct - at;
    const wt = tat - bt;
    const rt = firstStart - at;

    return {
      id: p.id,
      name: p.name || `Task ${p.id}`,
      arrivalTime: at,
      burstTime: bt,
      priority: priority,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  // Sort results by Process ID for clean tabular display
  results.sort((a, b) => comparePid(a.id, b.id));

  const totalTat = results.reduce((sum, r) => sum + r.turnaroundTime, 0);
  const totalWt = results.reduce((sum, r) => sum + r.waitingTime, 0);
  const totalRt = results.reduce((sum, r) => sum + r.responseTime, 0);
  const n = results.length;

  const totalTime = gantt.length > 0 ? gantt[gantt.length - 1].endTime : 0;
  const busyTime = gantt.reduce((sum, seg) => (seg.isIdle ? sum : sum + (seg.endTime - seg.startTime)), 0);
  const cpuUtilization = totalTime > 0 ? (busyTime / totalTime) * 100 : 0;

  return {
    results,
    gantt,
    summary: {
      totalProcesses: n,
      totalExecutionTime: totalTime,
      busyTime: busyTime,
      idleTime: totalTime - busyTime,
      cpuUtilization: Number(cpuUtilization.toFixed(2)),
      avgTurnaroundTime: Number((totalTat / n).toFixed(2)),
      avgWaitingTime: Number((totalWt / n).toFixed(2)),
      avgResponseTime: Number((totalRt / n).toFixed(2)),
    },
  };
}

// ==========================================
// 1. FCFS (First Come, First Served)
// ==========================================
export function simulateFCFS(processes) {
  // Sort by Arrival Time, tie-break by Process ID
  const queue = [...processes].map((p) => ({
    ...p,
    at: Number(p.arrivalTime),
    bt: Number(p.burstTime),
  }));

  queue.sort((a, b) => {
    if (a.at !== b.at) return a.at - b.at;
    return comparePid(a.id, b.id);
  });

  const timeline = [];
  const firstStartMap = {};
  const completionMap = {};
  let currentTime = 0;

  for (const p of queue) {
    if (currentTime < p.at) {
      timeline.push({
        pid: 'IDLE',
        name: 'CPU Idle',
        startTime: currentTime,
        endTime: p.at,
        isIdle: true,
      });
      currentTime = p.at;
    }

    firstStartMap[p.id] = currentTime;
    const endTime = currentTime + p.bt;

    timeline.push({
      pid: p.id,
      name: p.name || p.id,
      startTime: currentTime,
      endTime: endTime,
      isIdle: false,
    });

    currentTime = endTime;
    completionMap[p.id] = currentTime;
  }

  return computeMetrics(processes, timeline, firstStartMap, completionMap);
}

// ==========================================
// 2. SJF Non-Preemptive
// ==========================================
export function simulateSJFNonPreemptive(processes) {
  const pending = processes.map((p) => ({
    ...p,
    at: Number(p.arrivalTime),
    bt: Number(p.burstTime),
  }));

  const timeline = [];
  const firstStartMap = {};
  const completionMap = {};
  let currentTime = 0;
  let completed = 0;
  const n = pending.length;
  const isDone = new Array(n).fill(false);

  while (completed < n) {
    // Find all arrived and incomplete processes
    const available = [];
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && pending[i].at <= currentTime) {
        available.push({ ...pending[i], index: i });
      }
    }

    if (available.length === 0) {
      // CPU is idle until next process arrives
      let nextArrival = Infinity;
      for (let i = 0; i < n; i++) {
        if (!isDone[i] && pending[i].at < nextArrival) {
          nextArrival = pending[i].at;
        }
      }

      timeline.push({
        pid: 'IDLE',
        name: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        isIdle: true,
      });
      currentTime = nextArrival;
      continue;
    }

    // Pick shortest burst time; tie-break by arrival time, then PID
    available.sort((a, b) => {
      if (a.bt !== b.bt) return a.bt - b.bt;
      if (a.at !== b.at) return a.at - b.at;
      return comparePid(a.id, b.id);
    });

    const chosen = available[0];
    isDone[chosen.index] = true;

    firstStartMap[chosen.id] = currentTime;
    const endTime = currentTime + chosen.bt;

    timeline.push({
      pid: chosen.id,
      name: chosen.name || chosen.id,
      startTime: currentTime,
      endTime: endTime,
      isIdle: false,
    });

    currentTime = endTime;
    completionMap[chosen.id] = currentTime;
    completed++;
  }

  return computeMetrics(processes, timeline, firstStartMap, completionMap);
}

// ==========================================
// 3. SJF Preemptive (SRTF)
// ==========================================
export function simulateSJFPreemptive(processes) {
  const list = processes.map((p) => ({
    ...p,
    at: Number(p.arrivalTime),
    bt: Number(p.burstTime),
    rem: Number(p.burstTime),
  }));

  const totalBurst = list.reduce((sum, p) => sum + p.bt, 0);
  const maxArrival = Math.max(...list.map((p) => p.at));

  const timeline = [];
  const firstStartMap = {};
  const completionMap = {};

  let currentTime = 0;
  let completed = 0;
  const n = list.length;

  while (completed < n) {
    const available = [];
    for (let i = 0; i < n; i++) {
      if (list[i].at <= currentTime && list[i].rem > 0) {
        available.push(list[i]);
      }
    }

    if (available.length === 0) {
      let nextArrival = Infinity;
      for (let i = 0; i < n; i++) {
        if (list[i].rem > 0 && list[i].at < nextArrival) {
          nextArrival = list[i].at;
        }
      }

      timeline.push({
        pid: 'IDLE',
        name: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        isIdle: true,
      });
      currentTime = nextArrival;
      continue;
    }

    // Sort by remaining burst time; tie-break: arrival time, then PID
    available.sort((a, b) => {
      if (a.rem !== b.rem) return a.rem - b.rem;
      if (a.at !== b.at) return a.at - b.at;
      return comparePid(a.id, b.id);
    });

    const current = available[0];

    if (firstStartMap[current.id] === undefined) {
      firstStartMap[current.id] = currentTime;
    }

    // Execute for 1 unit of time
    timeline.push({
      pid: current.id,
      name: current.name || current.id,
      startTime: currentTime,
      endTime: currentTime + 1,
      isIdle: false,
    });

    current.rem -= 1;
    currentTime += 1;

    if (current.rem === 0) {
      completionMap[current.id] = currentTime;
      completed++;
    }
  }

  return computeMetrics(processes, timeline, firstStartMap, completionMap);
}

// ==========================================
// 4. Priority Non-Preemptive
// ==========================================
export function simulatePriorityNonPreemptive(processes) {
  const pending = processes.map((p) => ({
    ...p,
    at: Number(p.arrivalTime),
    bt: Number(p.burstTime),
    pr: Number(p.priority),
  }));

  const timeline = [];
  const firstStartMap = {};
  const completionMap = {};
  let currentTime = 0;
  let completed = 0;
  const n = pending.length;
  const isDone = new Array(n).fill(false);

  while (completed < n) {
    const available = [];
    for (let i = 0; i < n; i++) {
      if (!isDone[i] && pending[i].at <= currentTime) {
        available.push({ ...pending[i], index: i });
      }
    }

    if (available.length === 0) {
      let nextArrival = Infinity;
      for (let i = 0; i < n; i++) {
        if (!isDone[i] && pending[i].at < nextArrival) {
          nextArrival = pending[i].at;
        }
      }

      timeline.push({
        pid: 'IDLE',
        name: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        isIdle: true,
      });
      currentTime = nextArrival;
      continue;
    }

    // Lower numeric value = higher priority. Tie-break: arrival time, then PID
    available.sort((a, b) => {
      if (a.pr !== b.pr) return a.pr - b.pr;
      if (a.at !== b.at) return a.at - b.at;
      return comparePid(a.id, b.id);
    });

    const chosen = available[0];
    isDone[chosen.index] = true;

    firstStartMap[chosen.id] = currentTime;
    const endTime = currentTime + chosen.bt;

    timeline.push({
      pid: chosen.id,
      name: chosen.name || chosen.id,
      startTime: currentTime,
      endTime: endTime,
      isIdle: false,
    });

    currentTime = endTime;
    completionMap[chosen.id] = currentTime;
    completed++;
  }

  return computeMetrics(processes, timeline, firstStartMap, completionMap);
}

// ==========================================
// 5. Priority Preemptive
// ==========================================
export function simulatePriorityPreemptive(processes) {
  const list = processes.map((p) => ({
    ...p,
    at: Number(p.arrivalTime),
    bt: Number(p.burstTime),
    pr: Number(p.priority),
    rem: Number(p.burstTime),
  }));

  const timeline = [];
  const firstStartMap = {};
  const completionMap = {};

  let currentTime = 0;
  let completed = 0;
  const n = list.length;

  while (completed < n) {
    const available = [];
    for (let i = 0; i < n; i++) {
      if (list[i].at <= currentTime && list[i].rem > 0) {
        available.push(list[i]);
      }
    }

    if (available.length === 0) {
      let nextArrival = Infinity;
      for (let i = 0; i < n; i++) {
        if (list[i].rem > 0 && list[i].at < nextArrival) {
          nextArrival = list[i].at;
        }
      }

      timeline.push({
        pid: 'IDLE',
        name: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        isIdle: true,
      });
      currentTime = nextArrival;
      continue;
    }

    // Sort by priority (ascending value); tie-break: arrival time, then PID
    available.sort((a, b) => {
      if (a.pr !== b.pr) return a.pr - b.pr;
      if (a.at !== b.at) return a.at - b.at;
      return comparePid(a.id, b.id);
    });

    const current = available[0];

    if (firstStartMap[current.id] === undefined) {
      firstStartMap[current.id] = currentTime;
    }

    timeline.push({
      pid: current.id,
      name: current.name || current.id,
      startTime: currentTime,
      endTime: currentTime + 1,
      isIdle: false,
    });

    current.rem -= 1;
    currentTime += 1;

    if (current.rem === 0) {
      completionMap[current.id] = currentTime;
      completed++;
    }
  }

  return computeMetrics(processes, timeline, firstStartMap, completionMap);
}

// ==========================================
// 6. Round Robin (RR)
// ==========================================
export function simulateRoundRobin(processes, quantum = 2) {
  const q = Number(quantum);
  const list = processes.map((p) => ({
    ...p,
    at: Number(p.arrivalTime),
    bt: Number(p.burstTime),
    rem: Number(p.burstTime),
    inQueue: false,
  }));

  // Initial order sorted by arrival time, then PID
  list.sort((a, b) => {
    if (a.at !== b.at) return a.at - b.at;
    return comparePid(a.id, b.id);
  });

  const timeline = [];
  const firstStartMap = {};
  const completionMap = {};

  let currentTime = 0;
  let completed = 0;
  const n = list.length;
  const readyQueue = [];

  // Enqueue all processes arriving at time 0
  for (let i = 0; i < n; i++) {
    if (list[i].at <= currentTime && !list[i].inQueue) {
      readyQueue.push(list[i]);
      list[i].inQueue = true;
    }
  }

  while (completed < n) {
    if (readyQueue.length === 0) {
      // Find the next arriving unfinished process
      let nextArrival = Infinity;
      for (let i = 0; i < n; i++) {
        if (list[i].rem > 0 && list[i].at < nextArrival) {
          nextArrival = list[i].at;
        }
      }

      timeline.push({
        pid: 'IDLE',
        name: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        isIdle: true,
      });
      currentTime = nextArrival;

      // Add processes arriving at or before this new currentTime
      for (let i = 0; i < n; i++) {
        if (list[i].rem > 0 && list[i].at <= currentTime && !list[i].inQueue) {
          readyQueue.push(list[i]);
          list[i].inQueue = true;
        }
      }
      continue;
    }

    const current = readyQueue.shift();
    current.inQueue = false;

    if (firstStartMap[current.id] === undefined) {
      firstStartMap[current.id] = currentTime;
    }

    const execTime = Math.min(q, current.rem);
    const startSlice = currentTime;
    const endSlice = currentTime + execTime;

    timeline.push({
      pid: current.id,
      name: current.name || current.id,
      startTime: startSlice,
      endTime: endSlice,
      isIdle: false,
    });

    current.rem -= execTime;
    currentTime = endSlice;

    // Critical Round Robin ordering:
    // First enqueue new processes that arrived during this execution slice (startSlice, endSlice]
    for (let i = 0; i < n; i++) {
      if (
        list[i].rem > 0 &&
        list[i].at <= currentTime &&
        !list[i].inQueue &&
        list[i].id !== current.id
      ) {
        readyQueue.push(list[i]);
        list[i].inQueue = true;
      }
    }

    // Then, if the current process still needs CPU, re-enqueue it at the back of readyQueue
    if (current.rem > 0) {
      readyQueue.push(current);
      current.inQueue = true;
    } else {
      completionMap[current.id] = currentTime;
      completed++;
    }
  }

  return computeMetrics(processes, timeline, firstStartMap, completionMap);
}

/**
 * Main simulation dispatch function.
 */
export function runSimulation(algorithm, processes, quantum = 2) {
  switch (algorithm) {
    case 'fcfs':
      return simulateFCFS(processes);
    case 'sjf-non-preemptive':
      return simulateSJFNonPreemptive(processes);
    case 'sjf-preemptive':
      return simulateSJFPreemptive(processes);
    case 'priority-non-preemptive':
      return simulatePriorityNonPreemptive(processes);
    case 'priority-preemptive':
      return simulatePriorityPreemptive(processes);
    case 'round-robin':
      return simulateRoundRobin(processes, quantum);
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}
