/**
 * Deadlock Management Algorithms Engine
 * Sustainable Agriculture Monitoring System - Operating Systems PBL (NIET)
 *
 * Implements:
 * 1. Banker's Algorithm (Deadlock Avoidance & Safety Check)
 *    - Validates Allocation <= Maximum
 *    - Calculates Need Matrix (Need = Max - Allocation)
 *    - Determines whether system is in a SAFE state with full step-by-step Work updates
 *    - Discloses that UNSAFE does not strictly equal immediate deadlock
 *
 * 2. Deadlock Detection Algorithm (Multiple Resource Instances)
 *    - Uses Allocation, Request, and Available matrices
 *    - Identifies which processes can finish and which processes are deadlocked
 *
 * Agricultural Mapping:
 * - Processes: Irrigation Pumps, Fertilizer Injectors, Greenhouse Fans, Drone Recharging Stations
 * - Resources: Water Wells (m³/h), Fertilizer Chemical Tanks (L), Power Inverter Output (kW)
 */

/**
 * Validates Banker's Algorithm inputs
 */
export function validateBankersInput(processes, resources, allocation, max, available) {
  if (!processes || processes.length === 0) {
    return { valid: false, error: 'At least one process must be configured.' };
  }
  if (!resources || resources.length === 0) {
    return { valid: false, error: 'At least one resource type must be configured.' };
  }

  // Check Available vector
  for (let j = 0; j < resources.length; j++) {
    const rName = resources[j].name || `R${j}`;
    const val = Number(available[j]);
    if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
      return { valid: false, error: `Available resource "${rName}" must be a non-negative integer.` };
    }
  }

  // Check Allocation and Maximum matrices
  for (let i = 0; i < processes.length; i++) {
    const pName = processes[i].id || `P${i}`;
    for (let j = 0; j < resources.length; j++) {
      const rName = resources[j].name || `R${j}`;
      const allocVal = Number(allocation[i][j]);
      const maxVal = Number(max[i][j]);

      if (isNaN(allocVal) || allocVal < 0 || !Number.isInteger(allocVal)) {
        return { valid: false, error: `Process ${pName}: Allocation for ${rName} must be a non-negative integer.` };
      }
      if (isNaN(maxVal) || maxVal < 0 || !Number.isInteger(maxVal)) {
        return { valid: false, error: `Process ${pName}: Maximum claim for ${rName} must be a non-negative integer.` };
      }

      if (allocVal > maxVal) {
        return {
          valid: false,
          error: `Validation Error for ${pName}: Allocation of ${rName} (${allocVal}) cannot exceed Maximum claim (${maxVal}).`,
        };
      }
    }
  }

  return { valid: true, error: null };
}

/**
 * Computes Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
 */
export function computeNeedMatrix(allocation, max) {
  return max.map((row, i) =>
    row.map((maxVal, j) => Number(maxVal) - Number(allocation[i][j]))
  );
}

/**
 * Banker's Safety Algorithm
 */
export function runBankersSafetyAlgorithm(processes, resources, allocation, max, available) {
  const n = processes.length;
  const m = resources.length;
  const need = computeNeedMatrix(allocation, max);

  let work = available.map(Number);
  const finish = Array(n).fill(false);
  const safeSequence = [];
  const steps = [];

  let stepCounter = 1;
  let progressMade = true;

  while (progressMade) {
    progressMade = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        // Check if Need[i] <= Work for all resource types
        let canAllocate = true;
        for (let j = 0; j < m; j++) {
          if (need[i][j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          const workBefore = [...work];
          const procAlloc = allocation[i].map(Number);
          const workAfter = workBefore.map((w, j) => w + procAlloc[j]);

          steps.push({
            step: stepCounter++,
            processIndex: i,
            processId: processes[i].id || `P${i}`,
            processName: processes[i].name || `Task P${i}`,
            need: [...need[i]],
            workBefore,
            allocation: procAlloc,
            workAfter,
            satisfied: true,
            explanation: `Need [${need[i].join(', ')}] ≤ Work [${workBefore.join(', ')}]. Process ${processes[i].id} can finish its execution and release its allocated resources.`,
          });

          work = workAfter;
          finish[i] = true;
          safeSequence.push(processes[i].id || `P${i}`);
          progressMade = true;
        }
      }
    }
  }

  const isSafe = safeSequence.length === n;
  const unfinishedProcesses = processes.filter((_, i) => !finish[i]).map((p) => p.id || `P${i}`);

  return {
    isSafe,
    safeSequence,
    steps,
    need,
    finalWork: work,
    unfinishedProcesses,
    message: isSafe
      ? `System is in a SAFE state! Safe sequence found: <${safeSequence.join(', ')}>. All processes can complete without deadlock.`
      : `System is in an UNSAFE state. No process could satisfy its Need with current Work. Unfinished processes: {${unfinishedProcesses.join(', ')}}.`,
  };
}

/**
 * Validates Deadlock Detection inputs
 */
export function validateDetectionInput(processes, resources, allocation, request, available) {
  if (!processes || processes.length === 0) {
    return { valid: false, error: 'At least one process must be configured.' };
  }
  if (!resources || resources.length === 0) {
    return { valid: false, error: 'At least one resource type must be configured.' };
  }

  // Check Available
  for (let j = 0; j < resources.length; j++) {
    const rName = resources[j].name || `R${j}`;
    const val = Number(available[j]);
    if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
      return { valid: false, error: `Available resource "${rName}" must be a non-negative integer.` };
    }
  }

  // Check Allocation and Request matrices
  for (let i = 0; i < processes.length; i++) {
    const pName = processes[i].id || `P${i}`;
    for (let j = 0; j < resources.length; j++) {
      const rName = resources[j].name || `R${j}`;
      const allocVal = Number(allocation[i][j]);
      const reqVal = Number(request[i][j]);

      if (isNaN(allocVal) || allocVal < 0 || !Number.isInteger(allocVal)) {
        return { valid: false, error: `Process ${pName}: Allocation for ${rName} must be a non-negative integer.` };
      }
      if (isNaN(reqVal) || reqVal < 0 || !Number.isInteger(reqVal)) {
        return { valid: false, error: `Process ${pName}: Request for ${rName} must be a non-negative integer.` };
      }
    }
  }

  return { valid: true, error: null };
}

/**
 * Standard Deadlock Detection Algorithm (Multiple Resources)
 */
export function runDeadlockDetectionAlgorithm(processes, resources, allocation, request, available) {
  const n = processes.length;
  const m = resources.length;

  let work = available.map(Number);
  const finish = Array(n).fill(false);
  const steps = [];
  const completedProcesses = [];

  // Step 1: For processes holding 0 allocation, mark finish[i] = true
  for (let i = 0; i < n; i++) {
    let hasAlloc = false;
    for (let j = 0; j < m; j++) {
      if (Number(allocation[i][j]) !== 0) {
        hasAlloc = true;
        break;
      }
    }
    if (!hasAlloc) {
      finish[i] = true;
    }
  }

  let stepCounter = 1;
  let progressMade = true;

  while (progressMade) {
    progressMade = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        // Check if Request[i] <= Work for all resource types
        let canSatisfy = true;
        for (let j = 0; j < m; j++) {
          if (Number(request[i][j]) > work[j]) {
            canSatisfy = false;
            break;
          }
        }

        if (canSatisfy) {
          const workBefore = [...work];
          const procAlloc = allocation[i].map(Number);
          const workAfter = workBefore.map((w, j) => w + procAlloc[j]);

          steps.push({
            step: stepCounter++,
            processIndex: i,
            processId: processes[i].id || `P${i}`,
            processName: processes[i].name || `Task P${i}`,
            request: request[i].map(Number),
            workBefore,
            allocation: procAlloc,
            workAfter,
            satisfied: true,
            explanation: `Request [${request[i].join(', ')}] ≤ Work [${workBefore.join(', ')}]. Process ${processes[i].id} can receive requested resources, execute, and release its allocations.`,
          });

          work = workAfter;
          finish[i] = true;
          completedProcesses.push(processes[i].id || `P${i}`);
          progressMade = true;
        }
      }
    }
  }

  const deadlockedProcesses = processes.filter((_, i) => !finish[i]).map((p) => p.id || `P${i}`);
  const isDeadlocked = deadlockedProcesses.length > 0;

  return {
    isDeadlocked,
    deadlockedProcesses,
    completedProcesses,
    steps,
    finalWork: work,
    message: isDeadlocked
      ? `DEADLOCK DETECTED! The system contains a circular wait. Deadlocked processes: {${deadlockedProcesses.join(', ')}}.`
      : `NO DEADLOCK DETECTED. All processes can successfully complete with available resources. Execution order: <${completedProcesses.join(', ')}>.`,
  };
}
