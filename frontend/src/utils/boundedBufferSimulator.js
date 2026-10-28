/**
 * Bounded-Buffer Producer-Consumer Simulation Engine
 * Sustainable Agriculture Monitoring System - Operating Systems PBL (NIET)
 *
 * Simulates classical Dijkstra semaphores for process synchronization:
 * - mutex (Binary Semaphore, initialized to 1): Enforces Mutual Exclusion in Critical Section.
 * - empty (Counting Semaphore, initialized to N): Tracks available empty slots.
 * - full  (Counting Semaphore, initialized to 0): Tracks populated slots ready for consumption.
 *
 * Agricultural Mapping:
 * - Producer: Soil Moisture & Weather Stations writing sensor telemetry packets.
 * - Consumer: Automated Irrigation & Valve Controllers consuming packets to actuate valves.
 * - Bounded Buffer: Shared RAM ring buffer on farm IoT edge gateway.
 *
 * DISCLAIMER:
 * This is an academic educational simulator running in JavaScript state to visualize
 * semaphore transitions. It does not spawn actual OS kernel threads.
 */

export function createInitialState(capacity = 5) {
  const cap = Math.max(1, Math.min(20, parseInt(capacity, 10) || 5));
  return {
    capacity: cap,
    buffer: [],
    // Classical Semaphores
    semaphores: {
      mutex: 1,      // 1 = Free, 0 = Locked by critical section
      empty: cap,    // Available slots
      full: 0,       // Used slots
    },
    isInCriticalSection: false,
    activeActor: null, // 'PRODUCER' | 'CONSUMER' | null
    history: [
      {
        id: 1,
        timestamp: new Date().toLocaleTimeString(),
        action: 'INIT',
        actor: 'SYSTEM',
        status: 'SUCCESS',
        details: `Initialized empty bounded buffer with capacity N = ${cap}. Semaphores: mutex=1, empty=${cap}, full=0.`,
        beforeState: { mutex: 1, empty: cap, full: 0, count: 0 },
        afterState: { mutex: 1, empty: cap, full: 0, count: 0 },
      },
    ],
    nextItemId: 1,
  };
}

/**
 * Validates requested buffer capacity
 */
export function validateCapacity(capacity) {
  const cap = parseInt(capacity, 10);
  if (isNaN(cap) || cap < 1) {
    return { valid: false, error: 'Buffer capacity must be a positive integer >= 1.' };
  }
  if (cap > 20) {
    return { valid: false, error: 'For optimal visualization, maximum capacity is limited to 20 slots.' };
  }
  return { valid: true, capacity: cap };
}

/**
 * Producer operation: Adds an item to the bounded buffer using semaphores
 */
export function produceItem(state, customItem = null) {
  const currentCount = state.buffer.length;
  const beforeState = {
    mutex: state.semaphores.mutex,
    empty: state.semaphores.empty,
    full: state.semaphores.full,
    count: currentCount,
  };

  // 1. Condition: Check if buffer is full (wait(empty) condition)
  if (state.semaphores.empty <= 0 || currentCount >= state.capacity) {
    const logEntry = {
      id: state.history.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      action: 'PRODUCE_BLOCKED',
      actor: 'PRODUCER',
      status: 'BLOCKED',
      details:
        'PRODUCER BLOCKED: wait(empty) suspended the producer because empty == 0 (buffer full). Producing now would cause a buffer overflow and overwrite existing telemetry.',
      beforeState,
      afterState: beforeState,
    };

    return {
      success: false,
      blocked: true,
      reason: 'FULL_BUFFER',
      message: 'Buffer is full! Producer blocked on wait(empty).',
      newState: {
        ...state,
        history: [logEntry, ...state.history],
      },
    };
  }

  // 2. Condition: Check Mutual Exclusion (wait(mutex) condition)
  if (state.semaphores.mutex <= 0) {
    const logEntry = {
      id: state.history.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      action: 'MUTEX_BLOCKED',
      actor: 'PRODUCER',
      status: 'BLOCKED',
      details:
        'MUTEX CONFLICT: wait(mutex) suspended the producer because mutex == 0. Another process is currently in the critical section.',
      beforeState,
      afterState: beforeState,
    };

    return {
      success: false,
      blocked: true,
      reason: 'MUTEX_LOCKED',
      message: 'Critical section locked! Another process holds the mutex.',
      newState: {
        ...state,
        history: [logEntry, ...state.history],
      },
    };
  }

  // Generate realistic agricultural telemetry item
  const itemId = state.nextItemId;
  const item = customItem || {
    id: `PKT-${String(itemId).padStart(3, '0')}`,
    type: 'Telemetry Packet',
    moisture: Math.floor(35 + Math.random() * 40),
    temperature: (18 + Math.random() * 14).toFixed(1),
    timestamp: new Date().toLocaleTimeString(),
  };

  // Perform Semaphore State Transitions:
  // wait(empty) -> empty decreases by 1
  // wait(mutex) -> mutex becomes 0 (entered CS)
  // [CRITICAL SECTION: write to buffer]
  // signal(mutex) -> mutex restored to 1 (exited CS)
  // signal(full) -> full increases by 1
  const newBuffer = [...state.buffer, item];
  const newEmpty = state.capacity - newBuffer.length;
  const newFull = newBuffer.length;

  const afterState = {
    mutex: 1,
    empty: newEmpty,
    full: newFull,
    count: newBuffer.length,
  };

  const logEntry = {
    id: state.history.length + 1,
    timestamp: new Date().toLocaleTimeString(),
    action: 'PRODUCE_SUCCESS',
    actor: 'PRODUCER',
    status: 'SUCCESS',
    item,
    details: `PRODUCER: wait(empty) [${beforeState.empty}→${newEmpty}], wait(mutex) [1→0], appended ${item.id} (${item.moisture}% moisture) to slot ${newBuffer.length - 1}, signal(mutex) [0→1], signal(full) [${beforeState.full}→${newFull}].`,
    beforeState,
    afterState,
  };

  return {
    success: true,
    blocked: false,
    item,
    message: `Produced item ${item.id} successfully.`,
    newState: {
      ...state,
      buffer: newBuffer,
      semaphores: {
        mutex: 1,
        empty: newEmpty,
        full: newFull,
      },
      nextItemId: itemId + 1,
      history: [logEntry, ...state.history],
    },
  };
}

/**
 * Consumer operation: Removes an item from the bounded buffer using semaphores
 */
export function consumeItem(state) {
  const currentCount = state.buffer.length;
  const beforeState = {
    mutex: state.semaphores.mutex,
    empty: state.semaphores.empty,
    full: state.semaphores.full,
    count: currentCount,
  };

  // 1. Condition: Check if buffer is empty (wait(full) condition)
  if (state.semaphores.full <= 0 || currentCount === 0) {
    const logEntry = {
      id: state.history.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      action: 'CONSUME_BLOCKED',
      actor: 'CONSUMER',
      status: 'BLOCKED',
      details:
        'CONSUMER BLOCKED: wait(full) suspended the consumer because full == 0 (buffer empty). Consuming now would cause a buffer underflow and read garbage data.',
      beforeState,
      afterState: beforeState,
    };

    return {
      success: false,
      blocked: true,
      reason: 'EMPTY_BUFFER',
      message: 'Buffer is empty! Consumer blocked on wait(full).',
      newState: {
        ...state,
        history: [logEntry, ...state.history],
      },
    };
  }

  // 2. Condition: Check Mutual Exclusion (wait(mutex) condition)
  if (state.semaphores.mutex <= 0) {
    const logEntry = {
      id: state.history.length + 1,
      timestamp: new Date().toLocaleTimeString(),
      action: 'MUTEX_BLOCKED',
      actor: 'CONSUMER',
      status: 'BLOCKED',
      details:
        'MUTEX CONFLICT: wait(mutex) suspended the consumer because mutex == 0. Another process is currently in the critical section.',
      beforeState,
      afterState: beforeState,
    };

    return {
      success: false,
      blocked: true,
      reason: 'MUTEX_LOCKED',
      message: 'Critical section locked! Another process holds the mutex.',
      newState: {
        ...state,
        history: [logEntry, ...state.history],
      },
    };
  }

  // Perform Semaphore State Transitions:
  // wait(full) -> full decreases by 1
  // wait(mutex) -> mutex becomes 0 (entered CS)
  // [CRITICAL SECTION: read/remove from buffer]
  // signal(mutex) -> mutex restored to 1 (exited CS)
  // signal(empty) -> empty increases by 1
  const consumedItem = state.buffer[0];
  const newBuffer = state.buffer.slice(1);
  const newEmpty = state.capacity - newBuffer.length;
  const newFull = newBuffer.length;

  const afterState = {
    mutex: 1,
    empty: newEmpty,
    full: newFull,
    count: newBuffer.length,
  };

  const logEntry = {
    id: state.history.length + 1,
    timestamp: new Date().toLocaleTimeString(),
    action: 'CONSUME_SUCCESS',
    actor: 'CONSUMER',
    status: 'SUCCESS',
    item: consumedItem,
    details: `CONSUMER: wait(full) [${beforeState.full}→${newFull}], wait(mutex) [1→0], retrieved ${consumedItem.id} from head slot, signal(mutex) [0→1], signal(empty) [${beforeState.empty}→${newEmpty}].`,
    beforeState,
    afterState,
  };

  return {
    success: true,
    blocked: false,
    item: consumedItem,
    message: `Consumed item ${consumedItem.id} successfully.`,
    newState: {
      ...state,
      buffer: newBuffer,
      semaphores: {
        mutex: 1,
        empty: newEmpty,
        full: newFull,
      },
      history: [logEntry, ...state.history],
    },
  };
}

/**
 * Resets the buffer to empty while maintaining or updating capacity
 */
export function resetBuffer(state, newCapacity = null) {
  const cap = newCapacity !== null ? Math.max(1, Math.min(20, parseInt(newCapacity, 10) || 5)) : state.capacity;
  const logEntry = {
    id: state.history.length + 1,
    timestamp: new Date().toLocaleTimeString(),
    action: 'RESET',
    actor: 'SYSTEM',
    status: 'RESET',
    details: `Buffer reset to empty. Capacity set to N = ${cap}. Semaphores reinitialized: mutex=1, empty=${cap}, full=0.`,
    beforeState: {
      mutex: state.semaphores.mutex,
      empty: state.semaphores.empty,
      full: state.semaphores.full,
      count: state.buffer.length,
    },
    afterState: {
      mutex: 1,
      empty: cap,
      full: 0,
      count: 0,
    },
  };

  return {
    capacity: cap,
    buffer: [],
    semaphores: {
      mutex: 1,
      empty: cap,
      full: 0,
    },
    isInCriticalSection: false,
    activeActor: null,
    nextItemId: 1,
    history: [logEntry, ...state.history],
  };
}
