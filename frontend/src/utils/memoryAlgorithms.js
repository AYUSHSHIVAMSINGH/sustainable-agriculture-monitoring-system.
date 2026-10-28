/**
 * Memory Management Algorithms Engine
 * Sustainable Agriculture Monitoring System - Operating Systems PBL (NIET)
 *
 * Implements:
 * 1. First Fit: Allocates the first available block large enough for the process.
 * 2. Best Fit: Allocates the smallest available block large enough for the process.
 * 3. Worst Fit: Allocates the largest available block large enough for the process.
 *
 * Memory Allocation Model:
 * - Uses the classical fixed-partition contiguous memory model where each block can
 *   host at most one process.
 * - Internal Fragmentation: The unused space remaining inside an allocated block
 *   (Internal Fragmentation = Block Size - Process Size).
 * - External Fragmentation: Arises when unallocated processes cannot find a single block
 *   large enough to fit, even if the total remaining free memory across all unallocated
 *   blocks would have been sufficient.
 */

/**
 * Validates blocks and process memory requests
 */
export function validateMemoryInputs(blocks, processes) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return { valid: false, error: 'Please configure at least one memory block.' };
  }
  if (!Array.isArray(processes) || processes.length === 0) {
    return { valid: false, error: 'Please configure at least one process request.' };
  }

  const blockIds = new Set();
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const bid = String(b.id || '').trim();
    if (!bid) {
      return { valid: false, error: `Memory Block at row ${i + 1} is missing an ID.` };
    }
    if (blockIds.has(bid)) {
      return { valid: false, error: `Duplicate Block ID "${bid}". Block IDs must be unique.` };
    }
    blockIds.add(bid);

    const size = Number(b.size);
    if (isNaN(size) || size <= 0 || !Number.isInteger(size)) {
      return { valid: false, error: `Block ${bid}: Size must be a positive integer > 0 KB.` };
    }
  }

  const procIds = new Set();
  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];
    const pid = String(p.id || '').trim();
    if (!pid) {
      return { valid: false, error: `Process at row ${i + 1} is missing an ID.` };
    }
    if (procIds.has(pid)) {
      return { valid: false, error: `Duplicate Process ID "${pid}". Process IDs must be unique.` };
    }
    procIds.add(pid);

    const size = Number(p.size);
    if (isNaN(size) || size <= 0 || !Number.isInteger(size)) {
      return { valid: false, error: `Process ${pid}: Memory requirement must be a positive integer > 0 KB.` };
    }
  }

  return { valid: true, error: null };
}

/**
 * Core allocation runner
 */
function allocateMemory(algorithm, blocks, processes) {
  // Deep clone blocks with state
  const blockState = blocks.map((b) => ({
    id: b.id,
    name: b.name || `Block ${b.id}`,
    initialSize: Number(b.size),
    isAllocated: false,
    allocatedProcess: null,
    internalFragmentation: 0,
  }));

  const processAllocations = [];
  const steps = [];

  for (let i = 0; i < processes.length; i++) {
    const proc = processes[i];
    const pSize = Number(proc.size);
    let chosenBlockIndex = -1;

    // Filter available blocks that are large enough
    const candidateIndices = [];
    for (let j = 0; j < blockState.length; j++) {
      if (!blockState[j].isAllocated && blockState[j].initialSize >= pSize) {
        candidateIndices.push(j);
      }
    }

    if (candidateIndices.length > 0) {
      if (algorithm === 'first-fit') {
        // First candidate in order
        chosenBlockIndex = candidateIndices[0];
      } else if (algorithm === 'best-fit') {
        // Candidate with smallest initialSize
        chosenBlockIndex = candidateIndices.reduce((bestIdx, currIdx) => {
          if (bestIdx === -1) return currIdx;
          return blockState[currIdx].initialSize < blockState[bestIdx].initialSize ? currIdx : bestIdx;
        }, -1);
      } else if (algorithm === 'worst-fit') {
        // Candidate with largest initialSize
        chosenBlockIndex = candidateIndices.reduce((worstIdx, currIdx) => {
          if (worstIdx === -1) return currIdx;
          return blockState[currIdx].initialSize > blockState[worstIdx].initialSize ? currIdx : worstIdx;
        }, -1);
      }
    }

    if (chosenBlockIndex !== -1) {
      const targetBlock = blockState[chosenBlockIndex];
      const intFrag = targetBlock.initialSize - pSize;

      targetBlock.isAllocated = true;
      targetBlock.allocatedProcess = {
        id: proc.id,
        name: proc.name || `Task ${proc.id}`,
        size: pSize,
      };
      targetBlock.internalFragmentation = intFrag;

      processAllocations.push({
        id: proc.id,
        name: proc.name || `Task ${proc.id}`,
        size: pSize,
        allocated: true,
        blockId: targetBlock.id,
        blockSize: targetBlock.initialSize,
        internalFragmentation: intFrag,
      });

      steps.push({
        step: i + 1,
        processId: proc.id,
        processName: proc.name || proc.id,
        processSize: pSize,
        status: 'ALLOCATED',
        blockId: targetBlock.id,
        blockSize: targetBlock.initialSize,
        internalFragmentation: intFrag,
        explanation: `${proc.id} (${pSize} KB) was allocated to ${targetBlock.id} (${targetBlock.initialSize} KB). Unused space in block: ${intFrag} KB (internal fragmentation).`,
      });
    } else {
      processAllocations.push({
        id: proc.id,
        name: proc.name || `Task ${proc.id}`,
        size: pSize,
        allocated: false,
        blockId: null,
        blockSize: null,
        internalFragmentation: null,
      });

      steps.push({
        step: i + 1,
        processId: proc.id,
        processName: proc.name || proc.id,
        processSize: pSize,
        status: 'FAILED',
        blockId: null,
        blockSize: null,
        internalFragmentation: null,
        explanation: `${proc.id} (${pSize} KB) could NOT be allocated! No free block of size ≥ ${pSize} KB was available.`,
      });
    }
  }

  // Calculate Metrics
  const totalMemory = blockState.reduce((sum, b) => sum + b.initialSize, 0);
  const allocatedMemory = processAllocations
    .filter((p) => p.allocated)
    .reduce((sum, p) => sum + p.size, 0);
  const internalFragmentation = blockState
    .filter((b) => b.isAllocated)
    .reduce((sum, b) => sum + b.internalFragmentation, 0);
  const unallocatedFreeMemory = blockState
    .filter((b) => !b.isAllocated)
    .reduce((sum, b) => sum + b.initialSize, 0);
  const totalFreeMemory = internalFragmentation + unallocatedFreeMemory;

  const allocatedCount = processAllocations.filter((p) => p.allocated).length;
  const unallocatedCount = processAllocations.filter((p) => !p.allocated).length;

  // External Fragmentation Detection Check:
  // Is there any unallocated process whose size could theoretically fit into unallocatedFreeMemory?
  const unallocatedProcs = processAllocations.filter((p) => !p.allocated);
  const externalFragmentationVictims = unallocatedProcs.filter(
    (p) => p.size <= unallocatedFreeMemory
  );

  return {
    algorithm,
    blocks: blockState,
    processes: processAllocations,
    steps,
    metrics: {
      totalMemory,
      allocatedMemory,
      internalFragmentation,
      unallocatedFreeMemory,
      totalFreeMemory,
      memoryUtilization: totalMemory > 0 ? Number(((allocatedMemory / totalMemory) * 100).toFixed(2)) : 0,
      allocatedCount,
      unallocatedCount,
      hasExternalFragmentation: externalFragmentationVictims.length > 0,
      externalFragmentationVictims: externalFragmentationVictims.map((p) => p.id),
    },
  };
}

export function simulateFirstFit(blocks, processes) {
  return allocateMemory('first-fit', blocks, processes);
}

export function simulateBestFit(blocks, processes) {
  return allocateMemory('best-fit', blocks, processes);
}

export function simulateWorstFit(blocks, processes) {
  return allocateMemory('worst-fit', blocks, processes);
}

/**
 * Runs all three algorithms simultaneously for direct side-by-side comparison
 */
export function compareAllAlgorithms(blocks, processes) {
  return {
    firstFit: simulateFirstFit(blocks, processes),
    bestFit: simulateBestFit(blocks, processes),
    worstFit: simulateWorstFit(blocks, processes),
  };
}
