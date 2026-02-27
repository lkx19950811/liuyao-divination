---
name: "liuyao-test"
description: "Manages testing workflow for LiuYao divination app. Invoke when user asks to run tests, check coverage, or verify code quality."
---

# LiuYao Testing Workflow

This skill guides the testing process for the LiuYao (六爻预测) Electron application.

## Testing Stack

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing & component testing |
| Vue Test Utils | Vue component testing |
| Playwright | E2E testing |

## Test Categories

### 1. Unit Tests

**Location**: `src/**/*.test.ts` or `src/**/*.spec.ts`

**Run Command**:
```bash
npm run test
```

**Coverage Areas**:
- Hexagram calculation logic (`src/utils/hexagram.ts`)
- Calendar conversion (`src/services/calendar.ts`)
- Database operations (`src/main/database/`)
- IPC handlers (`src/main/ipc/`)

### 2. Component Tests

**Location**: `src/renderer/**/*.test.ts`

**Run Command**:
```bash
npm run test:components
```

**Coverage Areas**:
- Vue components rendering
- User interactions
- State management (Pinia stores)

### 3. E2E Tests

**Location**: `e2e/**/*.spec.ts`

**Run Command**:
```bash
npm run test:e2e
```

**Coverage Areas**:
- Complete divination flows
- History record management
- Settings persistence

## Test Commands

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- hexagram.test.ts

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Test Data

### Hexagram Test Data

```typescript
// test/fixtures/hexagrams.ts
export const hexagramFixtures = [
  { id: 1, name: '乾', upper: '乾', lower: '乾', binary: '111111' },
  { id: 2, name: '坤', upper: '坤', lower: '坤', binary: '000000' },
  // ... all 64 hexagrams
]
```

### Divination Test Cases

```typescript
// test/cases/divination.ts

// Time divination test cases
const timeDivinationCases = [
  { input: { year: 2026, month: 2, day: 27, hour: 14 }, expected: {...} },
  // ... more cases
]

// Number divination test cases
const numberDivinationCases = [
  { input: { num1: 168, num2: 888 }, expected: {...} },
  // ... more cases
]
```

## CI/CD Integration

Tests run automatically on:
- Pull request creation
- Push to main branch
- Before build process

## Quality Gates

| Metric | Threshold |
|--------|-----------|
| Unit Test Coverage | ≥ 80% |
| E2E Pass Rate | 100% |
| No Critical Bugs | Required |
| TypeScript Errors | 0 |

## Pre-commit Hook

Run linting and unit tests before each commit:
```bash
npm run lint && npm run test
```

## Test Checklist

Before submitting code, verify:

- [ ] All unit tests pass
- [ ] Test coverage meets threshold (≥80%)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] E2E tests pass (if applicable)
- [ ] New features have corresponding tests
- [ ] Bug fixes include regression tests
