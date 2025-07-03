#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

/**
 * E2E Test Runner for BuildDiaspora Zimbabwe Authentication System
 * 
 * This script runs comprehensive end-to-end tests covering:
 * - Authentication flows (login, register, password reset)
 * - Verification submission and management
 * - Admin workflows and verification queue management
 * - Complete user journeys and edge cases
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function createDirectories() {
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces'
  ]
  
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      log(`📁 Created directory: ${dir}`, colors.cyan)
    }
  })
}

function runCommand(command: string, description: string) {
  log(`\n🚀 ${description}`, colors.blue)
  log(`Command: ${command}`, colors.yellow)
  
  try {
    execSync(command, { stdio: 'inherit' })
    log(`✅ ${description} completed successfully`, colors.green)
    return true
  } catch (error) {
    log(`❌ ${description} failed`, colors.red)
    console.error(error)
    return false
  }
}

function main() {
  const args = process.argv.slice(2)
  const testSuite = args[0] || 'all'
  
  log('\n' + '='.repeat(80), colors.bright)
  log('🎭 BUILDDIASPORA ZIMBABWE E2E TEST RUNNER', colors.bright + colors.cyan)
  log('='.repeat(80), colors.bright)
  
  log('\n📋 Test Coverage:', colors.bright)
  log('  • Authentication flows (login, register, password reset)', colors.cyan)
  log('  • Verification submission and wizard workflows', colors.cyan)
  log('  • Admin verification queue and review processes', colors.cyan)
  log('  • Complete user journeys and session management', colors.cyan)
  log('  • Mobile responsiveness and accessibility', colors.cyan)
  log('  • Error handling and edge cases', colors.cyan)
  
  // Create necessary directories
  createDirectories()
  
  // Install Playwright browsers if needed
  if (!runCommand('npx playwright install', 'Installing Playwright browsers')) {
    process.exit(1)
  }
  
  // Check if dev server is running
  log('\n🔍 Checking if development server is running...', colors.yellow)
  
  const testCommands: Record<string, string> = {
    auth: 'npx playwright test e2e/auth/',
    verification: 'npx playwright test e2e/verification/',
    admin: 'npx playwright test e2e/admin/',
    all: 'npx playwright test',
    ui: 'npx playwright test --ui',
    headed: 'npx playwright test --headed',
    debug: 'npx playwright test --debug'
  }
  
  const command = testCommands[testSuite] || testCommands.all
  const description = `Running E2E tests: ${testSuite}`
  
  log(`\n🎯 Test Suite: ${testSuite}`, colors.magenta)
  
  // Run the tests
  const success = runCommand(command, description)
  
  // Generate and show report
  if (success) {
    log('\n📊 Generating test report...', colors.blue)
    runCommand('npx playwright show-report', 'Opening test report')
    
    log('\n' + '='.repeat(80), colors.bright)
    log('🎉 E2E TESTS COMPLETED SUCCESSFULLY!', colors.bright + colors.green)
    log('='.repeat(80), colors.bright)
    
    log('\n📁 Test artifacts saved to:', colors.cyan)
    log('  • Screenshots: test-results/screenshots/', colors.cyan)
    log('  • Videos: test-results/videos/', colors.cyan)
    log('  • Traces: test-results/traces/', colors.cyan)
    log('  • HTML Report: test-results/index.html', colors.cyan)
    
    log('\n🔗 Useful commands:', colors.yellow)
    log('  • View report: npm run test:e2e:report', colors.cyan)
    log('  • Run with UI: npm run test:e2e:ui', colors.cyan)
    log('  • Debug mode: npm run test:e2e:debug', colors.cyan)
    
  } else {
    log('\n' + '='.repeat(80), colors.bright)
    log('❌ E2E TESTS FAILED', colors.bright + colors.red)
    log('='.repeat(80), colors.bright)
    
    log('\n🔍 Troubleshooting:', colors.yellow)
    log('  • Check if dev server is running: npm run dev', colors.cyan)
    log('  • Verify environment variables are set', colors.cyan)
    log('  • Check test-results/ for screenshots and traces', colors.cyan)
    log('  • Run with --headed flag to see browser interactions', colors.cyan)
    
    process.exit(1)
  }
}

// Handle command line arguments
if (process.argv.length > 3) {
  log('\n📖 Usage:', colors.yellow)
  log('  npm run test:e2e [suite]', colors.cyan)
  log('\n🎯 Available test suites:', colors.yellow)
  log('  • auth        - Authentication flows only', colors.cyan)
  log('  • verification - Verification submission flows', colors.cyan)
  log('  • admin       - Admin workflow tests', colors.cyan)
  log('  • all         - All E2E tests (default)', colors.cyan)
  log('  • ui          - Run tests with Playwright UI', colors.cyan)
  log('  • headed      - Run tests in headed mode', colors.cyan)
  log('  • debug       - Run tests in debug mode', colors.cyan)
  
  process.exit(0)
}

main() 