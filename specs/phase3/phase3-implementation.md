# Phase 3 Implementation Specification & Tasklist

**Target:** Junior AI Coding Agent (Google Antigravity CLI)
**Context:** Vue 3 + TypeScript + Vuetify 3 (PWA)
**Objective:** Implement Telemetry, Progression Tracking, and IndexedDB Persistence.

---

## 🤖 Agent Directives

1. **Sequential Execution:** Execute the following tasks strictly in order. Do not jump to UI components before the data layer is finalized.
2. **Zero-Dependency Rule:** Use native browser APIs for `IndexedDB`. Do NOT install external wrappers like `localforage` or `idb`.
3. **Strict Typing:** Ensure all TypeScript files compile with `strict: true`. Avoid `any`.
4. **State Integrity:** Respect the `isHydrated` boot barrier in all UI components.

---

## Final Desired State

A fully functional telemetry and persistence pipeline where completed workouts are safely written to IndexedDB, historical volume is calculated backward sequentially to prevent unearned progression, and the UI safely handles edge cases (like users closing the app without saving soreness feedback) using defensive timeouts.

---

## Step-by-Step Tasklist

### Task 1: Establish Strict Storage Types

**File:** `src/core/StorageTypes.ts`
**Objective:** Define the core contracts for the persistence layer.
**Actionable Steps:**

1. Create the file and define the `TelemetryStatus` union type: `'PENDING_TELEMETRY' | 'SEALED' | 'SEALED_CONSERVATIVE'`.
2. Export the `CompletedSessionRecord` interface exactly as defined:

- `version: number`
- `sessionToken: string`
- `completedAt: number`
- `chartNumber: number`
- `levelString: string`
- `durationSeconds: number`
- `telemetryStatus: TelemetryStatus`
- `userFlaggedStiffOrSore?: boolean`

### Task 2: Implement Native IndexedDB Adapter

**File:** `src/core/storage/IndexedDBAdapter.ts`
**Objective:** Build a thin wrapper around native IndexedDB for historical session logs.
**Actionable Steps:**

1. Implement the `IPersistenceAdapter` interface.
2. Initialize `DB_NAME = 'ya-5bx'` and `DB_VERSION = 1`.
3. Create `openAsync()`: Handle the `onupgradeneeded` event to create an object store named `sessions` with `keyPath: 'sessionToken'`. Create two indexes: `byLevel` (array of `[chartNumber, levelString]`) and `byDate` (`completedAt`).
4. Implement `commitCompletedWorkoutAsync(record)` using a **Two-Phase Commit**:

- _Phase 1:_ Write the `CompletedSessionRecord` to IndexedDB.
- _Phase 2:_ Await the success event. ONLY on success, call `localStorage.removeItem('ya_5bx_wal')` (or your equivalent WAL key) to clear the hot state.

5. Implement `getAllSessionsAsync()` returning all records sorted by `completedAt` ascending.

### Task 3: Build the History Aggregator

**File:** `src/core/storage/HistoryAggregator.ts`
**Objective:** Safely calculate contiguous workout volume.
**Actionable Steps:**

1. Export a static method `calculateContiguousVolume(history: CompletedSessionRecord[], targetChart: number, targetLevel: string): number`.
2. **Logic Check:** Sort/iterate the `history` array strictly _backwards_ (newest first).
3. Count sessions where `chartNumber` and `levelString` match the targets.
4. **CRITICAL:** `break` the loop immediately upon encountering a record that does _not_ match the target chart/level. This prevents disjointed historical sessions from inflating the contiguous volume count.

### Task 4: Implement Telemetry Service

**File:** `src/core/telemetry/TelemetryService.ts`
**Objective:** Manage the state transition of workout records from pending to sealed.
**Actionable Steps:**

1. Inject `IndexedDBAdapter` via the constructor.
2. Implement `stagePendingSessionAsync(record)`: Calls the adapter's commit method, overriding the status to `'PENDING_TELEMETRY'`.
3. Implement `sealSessionTelemetryAsync(sessionToken: string, isStiffOrSore: boolean, isConservative: boolean = false)`:

- Fetch the record by token.
- Update `userFlaggedStiffOrSore`.
- Set status to `'SEALED_CONSERVATIVE'` if `isConservative` is true, otherwise `'SEALED'`.
- Save back to IndexedDB.

### Task 5: Scaffold the Progression Pinia Store

**File:** `src/stores/useProgressionStore.ts`
**Objective:** Wrap the domain logic in Vue reactivity with a hydration barrier.
**Actionable Steps:**

1. Import Pinia's `defineStore`. Instatiate `IndexedDBAdapter`, `TelemetryService`, and `ProgressionValidator`.
2. Define reactive state: `isHydrated = ref(false)` and `rawHistory = shallowRef<CompletedSessionRecord[]>([])`.
3. Define `initAsync()`: Await `adapter.openAsync()`, populate `rawHistory`, and finally set `isHydrated.value = true`.
4. Create a computed property `validationResult`:

- Return `null` if `!isHydrated.value`.
- Else, use `HistoryAggregator` to build the `LevelHistorySnapshot` and pass it to `validator.validate(...)`.

5. Return all refs and methods.

### Task 6: Build Defensive Post-Workout Dialog

**File:** `src/components/PostWorkoutDialog.vue`
**Objective:** Capture user soreness telemetry safely, assuming pain if the user abandons the app.
**Actionable Steps:**

1. Accept `sessionToken` as a prop. Access `TelemetryService`.
2. On `onMounted`, start a `setTimeout` for exactly 60 seconds.
3. Provide UI buttons for "I feel fine" (triggers `sealSessionTelemetryAsync(token, false)`) and "I am stiff/sore" (triggers `sealSessionTelemetryAsync(token, true)`). Clear the timeout if the user clicks.
4. **Safety Fallback:** If the 60-second timeout fires, OR if the component triggers `onUnmounted` before a choice is made, automatically execute `sealSessionTelemetryAsync(token, true, true)` (Conservative Seal).

### Task 7: Build the Progression Map Visualizer

**File:** `src/components/ProgressionMap.vue`
**Objective:** Visualize the 6x12 matrix.
**Actionable Steps:**

1. Import `charts_matrix.json` and `useProgressionStore`.
2. Wrap the entire template in a `v-if="store.isHydrated"` to prevent rendering during IndexedDB async boot. Display a `<v-progress-circular>` fallback.
3. Map over charts and levels to create a grid/list. Apply Vuetify styling classes dynamically based on conditions:

- **Completed:** Green (`#4CAF50`) if history shows completions.
- **Current:** Vuetify `primary` color if it matches the user's active level.
- **Eligible:** Amber (`#FF9800`) if `validationResult.isEligible` matches this cell.
- **Locked:** Default Vuetify surface color.

### Task 8: Wire Telemetry into the Workout Loop

**File:** `src/components/WorkoutCard.vue`
**Objective:** Trigger Phase 3 logic when the engine reaches the terminal state.
**Actionable Steps:**

1. Import `useProgressionStore` and access `telemetryService`.
2. Setup a `ref` for `showSummaryDialog = false`.
3. Set up a Vue `watch` on `lifecycle` (from `useWorkoutEngine`).
4. If `newLifecycle === OrchestratorLifecycle.COMPLETED`:

- Construct the base record from the engine `snapshot`.
- `await telemetryService.stagePendingSessionAsync(record)`.
- Set `showSummaryDialog.value = true` to render `<PostWorkoutDialog>`.

---

## ✅ Acceptance Checklist for AI Agent

- [ ] TypeScript compiler runs without errors (`vue-tsc --noEmit`).
- [ ] Linter passes (`eslint src/`).
- [ ] No external database dependencies were added to `package.json`.
- [ ] `HistoryAggregator` breaks its loop correctly on level mismatches.
- [ ] `PostWorkoutDialog` contains the 60-second `setTimeout` conservative fallback.
- [ ] Two-phase commit clears WAL only after IndexedDB resolves.
