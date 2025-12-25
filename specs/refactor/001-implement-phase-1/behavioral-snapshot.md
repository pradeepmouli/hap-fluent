# Behavioral Snapshot

**Purpose**: Document observable behavior before refactoring to verify it's preserved after all 6 phases.

## Key Behaviors to Preserve

### Behavior 1: FluentService Creation and Characteristic Access
**Input**: Create a FluentService wrapping a HAP Lightbulb service
**Expected Output**:
- Service created successfully
- Characteristic properties accessible (On, Brightness, Hue, Saturation)
- Each characteristic is a FluentCharacteristic instance
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 2: Characteristic Value Getting
**Input**: Get current value of a characteristic (e.g., On state)
**Expected Output**: Returns current value with correct type (boolean for On)
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 3: Characteristic Value Setting
**Input**: Set a characteristic value (e.g., Brightness to 75)
**Expected Output**:
- Value updated on underlying HAP characteristic
- No exceptions thrown for valid values
- HAP-NodeJS updateValue called
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 4: Handler Registration (onGet/onSet)
**Input**: Register async GET and SET handlers on a characteristic
**Expected Output**:
- Handlers registered successfully
- GET handler called when HomeKit reads value
- SET handler called when HomeKit writes value
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 5: Service with Subtype
**Input**: Create service with subtype parameter (e.g., for multiple lights)
**Expected Output**:
- Service created with subtype
- Can retrieve same service later using subtype
- Different from service without subtype
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 6: AccessoryHandler Initialization
**Input**: Initialize AccessoryHandler with platform accessory
**Expected Output**:
- Handler created successfully
- Can access services via handler
- Services properly wrapped
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 7: Type Safety - Characteristic Keys
**Input**: Attempt to access characteristic that doesn't exist on service type
**Expected Output**: TypeScript compilation error (design time)
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

### Behavior 8: Type Safety - Characteristic Values
**Input**: Attempt to set incorrect value type (e.g., string for boolean characteristic)
**Expected Output**: TypeScript compilation error (design time)
**Actual Output** (before): [Run and document]
**Actual Output** (after): [Re-run after refactoring - must match]

## Test Commands
```bash
# Run existing test suite
cd packages/hap-fluent
pnpm run test

# Run specific integration scenarios
pnpm run test FluentService.test.ts
pnpm run test FluentCharacteristic.test.ts
pnpm run test FluentAccessory.test.ts
pnpm run test integration.test.ts

# Type check examples
pnpm run type-check

# Build to verify no compilation errors
pnpm run build
```

## Phase-Specific Behaviors to Add (Not Breaking Changes)

### Phase 1: New Error Handling
- Async operations now throw typed errors (FluentCharacteristicError, ValidationError)
- Invalid inputs caught and reported clearly
- **NOT a breaking change**: Errors that silently failed before now throw

### Phase 2: New Developer Features
- Debug logging available (opt-in via DEBUG environment variable)
- Better error messages (additive, not breaking)

### Phase 3: Test Infrastructure
- Additional test coverage (no behavior changes)
- Integration tests validate existing behavior

### Phase 4: Optional New Features
- Validation framework (opt-in via addValidator())
- Event system (opt-in via .on())
- Middleware (opt-in via .use())
- **All optional**: Default behavior unchanged

### Phase 5: Performance Optimizations
- Caching (opt-in via enableCache())
- Batching (new methods, doesn't affect existing)

### Phase 6: Build Improvements
- Source maps (debugging aid, no API changes)
- Modern exports (better imports, same functionality)

## Critical Invariants

1. **All existing tests MUST pass** without modification
2. **Public API signatures unchanged** (or deprecated with backwards compatibility)
3. **TypeScript types unchanged** (can be strengthened but not weakened)
4. **HAP-NodeJS integration unchanged** (same underlying behavior)
5. **No runtime performance regression** (must be ≤5% change)

---
*Verify all behaviors before implementing each phase. If ANY behavior changes unexpectedly, STOP and investigate.*
