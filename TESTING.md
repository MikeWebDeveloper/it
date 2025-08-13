# Testing Documentation

The IT Quiz App includes comprehensive testing coverage with both unit and E2E tests.

## Testing Stack

### Unit Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers

### E2E Testing
- **Playwright** - End-to-end testing framework
- **Mobile testing** - Responsive design validation

## Test Coverage

### Unit Tests (`__tests__/`)

#### Components
- `QuestionCard.test.tsx` - Tests question display, answer selection, and progress
- `AnswerChoice.test.tsx` - Tests answer option states and interactions

#### Store
- `useQuizStore.test.ts` - Tests state management, quiz flow, and persistence

#### Pages
- `page.test.tsx` - Tests home page rendering and integration

### E2E Tests (`tests/e2e/`)

#### Core Functionality
- `quiz.spec.ts` - Tests complete user flows:
  - Home page navigation
  - Quiz mode selection
  - Mobile responsiveness
  - Dark mode toggle
  - PWA functionality

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests
npm run test:all
```

### Development Server
E2E tests automatically start the development server on port 3001.

## Test Configuration

### Jest Configuration (`jest.config.ts`)
- Uses Next.js Jest transformer
- JSDOM environment for browser APIs
- Module path mapping for imports
- Coverage collection setup

### Playwright Configuration (`playwright.config.ts`)
- Desktop and mobile test execution
- Automatic server startup
- Retry logic for CI/CD
- HTML reporting

## Test Features

### Mobile-First Testing
- Touch target validation (44px minimum)
- Viewport responsiveness
- Mobile navigation flow

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- ARIA attributes validation

### PWA Testing
- Service worker registration
- Manifest.json validation
- Offline functionality

### State Management Testing
- localStorage persistence
- Quiz session management
- Progress tracking
- Theme switching

## Best Practices

1. **Component Tests**: Focus on user interactions and visual states
2. **Store Tests**: Validate business logic and state transitions
3. **E2E Tests**: Test complete user journeys
4. **Mobile Tests**: Ensure touch-friendly interfaces
5. **Mocking**: Mock external dependencies for isolation

## CI/CD Integration

Tests are configured for continuous integration:
- Jest runs in CI mode with coverage reporting
- Playwright runs with retry logic
- Both frameworks support parallel execution

## Coverage Goals

- **Unit Tests**: >90% code coverage
- **E2E Tests**: Complete user flow coverage
- **Mobile Tests**: Full responsive design validation
- **Accessibility**: WCAG 2.1 AA compliance verification