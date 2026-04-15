# Installation

## Prerequisites

- Node.js **18 or later**
- TypeScript **5.9+** (recommended)

## Install

```bash
npm install hap-fluent
```

### Peer dependencies

HAP Fluent requires the following peer dependencies:

```bash
npm install homebridge@>=1.11.0 hap-nodejs@>=0.13.0
```

## Verify

```typescript
import { initializeAccessory, getOrAddService } from 'hap-fluent';

// In your accessory constructor:
const lightbulb = getOrAddService(accessory, api.hap.Service.Lightbulb, 'My Light');
console.log('hap-fluent loaded:', typeof lightbulb.onGet === 'function');
```
