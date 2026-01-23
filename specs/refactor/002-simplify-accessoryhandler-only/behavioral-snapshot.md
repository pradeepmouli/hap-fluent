# Behavioral Snapshot — refactor-002

This captures observable behaviors to PRESERVE before and after refactoring. Run checks pre-refactor baseline and post-refactor; outputs MUST be identical.

## Key Behaviors
1. Handler Creation
	 - Input: an Accessory instance
	 - Operation: `wrapAccessory(accessory)`
	 - Output: `AccessoryHandler` instance bound to the provided accessory

2. Initialization Side Effects
	 - Operation: `handler.initialize()`
	 - Expected Effects (same as `initializeAccessory(accessory)`):
		 - Accessory registered/wired as before
		 - Interceptors and logging attached as before
		 - No new or missing side effects

3. Service Addition Idempotency
	 - Operation: `handler.addService(serviceType, subtype?)`
	 - Expected:
		 - If service exists: returns existing service (no duplicate created)
		 - If missing: creates, registers, and returns the new service
		 - Mirrors `getOrAddService(...)` behavior

4. Error Behavior
	 - Invalid service type/subtype produce the same error types/messages observed pre-refactor.

## Verification Checklist
- [ ] Create handler via `wrapAccessory` and confirm instance methods operate on the given accessory.
- [ ] Compare side effects of `initializeAccessory(accessory)` vs `wrapAccessory(accessory).initialize()` (identical).
- [ ] Call `addService` twice for same type/subtype; confirm the second call returns the same service instance.
- [ ] Validate error cases (invalid type/subtype) match pre-refactor error types/messages.
- [ ] Run unit, property-based, and integration tests; results match baseline.

## Inputs/Outputs Summary
- Input: Accessory
	- Output: AccessoryHandler tied to input accessory
- Input: AccessoryHandler.initialize()
	- Output: Same side effects/state changes as legacy initialization
- Input: AccessoryHandler.addService(type, subtype?)
	- Output: Existing or newly created service, with idempotent behavior

## Notes
- Legacy free functions (`initializeAccessory`, `getOrAddService`) remain as thin wrappers delegating to the handler to avoid external behavior changes during the refactor.
# Behavioral Snapshot

**Purpose**: Document observable behavior before refactoring to verify it's preserved after.

## Key Behaviors to Preserve

### Behavior 1: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 2: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 3: [Description]
**Input**: [Specific input data/conditions]
**Expected Output**: [Exact expected result]
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

## Test Commands
```bash
# Commands to reproduce behaviors
npm test -- [specific test]
npm run dev # Manual testing steps...
```

---
*Update this file with actual behaviors before starting refactoring*
