#!/bin/bash

# IT Quiz App - Comprehensive E2E Test Runner
# This script runs the complete end-to-end test suite with different configurations

echo "🚀 Starting Comprehensive E2E Testing for IT Quiz App"
echo "=================================================="

# Create test results directories
mkdir -p test-results/screenshots
mkdir -p test-results/comprehensive
mkdir -p test-results/integration
mkdir -p test-results/performance
mkdir -p test-results/accessibility
mkdir -p test-results/failures

# Check if development server is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Development server not running on port 3001"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo "✅ Development server is running"

# Run different test suites based on argument
case "$1" in
    "quick")
        echo "🏃‍♂️ Running Quick Test Suite"
        npx playwright test tests/e2e/quiz.spec.ts --reporter=html
        ;;
    "comprehensive")
        echo "🎯 Running Comprehensive User Journey Tests"
        npx playwright test tests/e2e/comprehensive-user-journeys.spec.ts --reporter=html --timeout=60000
        ;;
    "integration")
        echo "🔗 Running Integration & Data Flow Tests"
        npx playwright test tests/e2e/integration-data-flow.spec.ts --reporter=html --timeout=45000
        ;;
    "performance")
        echo "⚡ Running Performance & Accessibility Tests"
        npx playwright test tests/e2e/performance-accessibility.spec.ts --reporter=html --timeout=30000
        ;;
    "mobile")
        echo "📱 Running Mobile-Specific Tests"
        npx playwright test tests/e2e/comprehensive-user-journeys.spec.ts --project="Mobile Chrome" --reporter=html
        ;;
    "master")
        echo "🎭 Running Master E2E Test Suite"
        npx playwright test tests/e2e/comprehensive-suite.spec.ts --reporter=html --timeout=120000
        ;;
    "all")
        echo "🌟 Running Complete Test Suite"
        npx playwright test tests/e2e/ --reporter=html --timeout=60000
        ;;
    *)
        echo "Usage: $0 {quick|comprehensive|integration|performance|mobile|master|all}"
        echo ""
        echo "Test Suites:"
        echo "  quick        - Basic functionality tests (5-10 mins)"
        echo "  comprehensive - Complete user journeys (15-20 mins)"
        echo "  integration  - Data flow and state management (10-15 mins)"
        echo "  performance  - Performance and accessibility (10-15 mins)"
        echo "  mobile       - Mobile-specific tests (10-15 mins)"
        echo "  master       - Master test suite (20-30 mins)"
        echo "  all          - All test suites (30-45 mins)"
        exit 1
        ;;
esac

echo ""
echo "✅ Test execution completed!"
echo "📊 View results in playwright-report/index.html"
echo "📸 Screenshots saved in test-results/"
echo ""
echo "Quick Analysis:"
echo "- Check test-results/comprehensive/ for user journey screenshots"
echo "- Check test-results/performance/ for performance metrics"
echo "- Check test-results/integration/ for data flow validation"
echo "- Check test-results/failures/ for any failed test screenshots"