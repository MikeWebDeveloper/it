#!/usr/bin/env node

/**
 * Vercel Deployment Validation Script
 * Validates deployment readiness for Next.js 15 on Vercel
 */

const fs = require('fs');
const path = require('path');

class VercelDeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  addError(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addSuccess(message) {
    this.success.push(message);
    this.log(message, 'success');
  }

  fileExists(filePath) {
    return fs.existsSync(path.resolve(filePath));
  }

  readJSON(filePath) {
    try {
      const content = fs.readFileSync(path.resolve(filePath), 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.addError(`Failed to read ${filePath}: ${error.message}`);
      return null;
    }
  }

  validatePackageJson() {
    this.log('Validating package.json...');
    
    if (!this.fileExists('package.json')) {
      this.addError('package.json not found');
      return;
    }

    const pkg = this.readJSON('package.json');
    if (!pkg) return;

    // Check required scripts
    const requiredScripts = ['build', 'build:vercel', 'start'];
    requiredScripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        this.addSuccess(`Required script '${script}' found`);
      } else {
        this.addError(`Missing required script: '${script}'`);
      }
    });

    // Check Next.js version
    if (pkg.dependencies && pkg.dependencies.next) {
      const nextVersion = pkg.dependencies.next;
      if (nextVersion.includes('15')) {
        this.addSuccess(`Next.js 15 detected: ${nextVersion}`);
      } else {
        this.addWarning(`Next.js version may not be optimal for Vercel: ${nextVersion}`);
      }
    } else {
      this.addError('Next.js dependency not found');
    }

    // Check for TypeScript
    if (pkg.dependencies?.typescript || pkg.devDependencies?.typescript) {
      this.addSuccess('TypeScript configuration detected');
    }
  }

  validateVercelJson() {
    this.log('Validating vercel.json...');
    
    if (!this.fileExists('vercel.json')) {
      this.addWarning('vercel.json not found (using Vercel defaults)');
      return;
    }

    const vercelConfig = this.readJSON('vercel.json');
    if (!vercelConfig) return;

    // Check required fields
    if (vercelConfig.version === 2) {
      this.addSuccess('Vercel configuration version 2 detected');
    } else {
      this.addError('vercel.json should use version 2');
    }

    // Check framework
    if (vercelConfig.framework === 'nextjs') {
      this.addSuccess('Next.js framework specified in vercel.json');
    }

    // Check build command
    if (vercelConfig.buildCommand) {
      this.addSuccess(`Custom build command: ${vercelConfig.buildCommand}`);
    }

    // Check memory allocation
    if (vercelConfig.functions) {
      this.addSuccess('Memory allocation configured for functions');
    }

    // Validate headers
    if (vercelConfig.headers && vercelConfig.headers.length > 0) {
      this.addSuccess('Security headers configured');
    }
  }

  validateNextConfig() {
    this.log('Validating Next.js configuration...');
    
    const nextConfigFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs'];
    const configFile = nextConfigFiles.find(file => this.fileExists(file));
    
    if (!configFile) {
      this.addWarning('No Next.js config file found (using defaults)');
      return;
    }

    this.addSuccess(`Next.js config found: ${configFile}`);

    try {
      const configContent = fs.readFileSync(path.resolve(configFile), 'utf-8');
      
      // Check for Vercel optimizations
      if (configContent.includes('standalone')) {
        this.addSuccess('Standalone output configuration detected');
      }

      if (configContent.includes('swcMinify')) {
        this.addSuccess('SWC minification enabled');
      }

      if (configContent.includes('webpackMemoryOptimizations')) {
        this.addSuccess('Webpack memory optimizations enabled');
      }

      if (configContent.includes('experimental')) {
        this.addSuccess('Experimental optimizations configured');
      }
    } catch (error) {
      this.addError(`Failed to validate Next.js config: ${error.message}`);
    }
  }

  validateVercelIgnore() {
    this.log('Validating .vercelignore...');
    
    if (!this.fileExists('.vercelignore')) {
      this.addWarning('.vercelignore not found (using Vercel defaults)');
      return;
    }

    try {
      const ignoreContent = fs.readFileSync(path.resolve('.vercelignore'), 'utf-8');
      
      const recommendedPatterns = [
        'node_modules/',
        '.next/cache/',
        '**/*.test.*',
        'coverage/',
        'playwright-report/'
      ];

      recommendedPatterns.forEach(pattern => {
        if (ignoreContent.includes(pattern)) {
          this.addSuccess(`Recommended ignore pattern found: ${pattern}`);
        } else {
          this.addWarning(`Consider adding ignore pattern: ${pattern}`);
        }
      });
    } catch (error) {
      this.addError(`Failed to validate .vercelignore: ${error.message}`);
    }
  }

  validateApiEndpoints() {
    this.log('Validating API endpoints...');
    
    const apiDir = path.resolve('src/app/api');
    if (!fs.existsSync(apiDir)) {
      this.addWarning('No API routes found');
      return;
    }

    // Check for health endpoint
    const healthEndpoint = path.resolve('src/app/api/health');
    if (fs.existsSync(healthEndpoint)) {
      this.addSuccess('Health check endpoint found');
    } else {
      this.addWarning('Health check endpoint not found');
    }

    // Check for monitoring endpoints
    const monitoringDir = path.resolve('src/app/api/monitoring');
    if (fs.existsSync(monitoringDir)) {
      this.addSuccess('Monitoring endpoints found');
    }
  }

  validateDeploymentReadiness() {
    this.log('Checking overall deployment readiness...');
    
    // Check for essential files
    const essentialFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
    ];

    essentialFiles.forEach(file => {
      if (this.fileExists(file)) {
        this.addSuccess(`Essential file found: ${file}`);
      } else {
        this.addError(`Missing essential file: ${file}`);
      }
    });

    // Check for Next.js app directory
    if (this.fileExists('src/app')) {
      this.addSuccess('Next.js App Router structure detected');
    } else {
      this.addError('Next.js App Router structure not found');
    }
  }

  generateReport() {
    this.log('\\n=== VERCEL DEPLOYMENT VALIDATION REPORT ===');
    
    if (this.success.length > 0) {
      this.log(`\\n✅ SUCCESS (${this.success.length}):`);
      this.success.forEach(msg => console.log(`  ✅ ${msg}`));
    }

    if (this.warnings.length > 0) {
      this.log(`\\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach(msg => console.log(`  ⚠️  ${msg}`));
    }

    if (this.errors.length > 0) {
      this.log(`\\n❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach(msg => console.log(`  ❌ ${msg}`));
    }

    const score = this.success.length / (this.success.length + this.warnings.length + this.errors.length) * 100;
    this.log(`\\n📊 DEPLOYMENT READINESS SCORE: ${score.toFixed(1)}%`);

    if (this.errors.length === 0) {
      this.log('\\n🚀 READY FOR VERCEL DEPLOYMENT!');
      return true;
    } else {
      this.log('\\n🛑 DEPLOYMENT BLOCKED - Fix errors before deploying');
      return false;
    }
  }

  async run() {
    this.log('Starting Vercel deployment validation...');
    
    this.validatePackageJson();
    this.validateVercelJson();
    this.validateNextConfig();
    this.validateVercelIgnore();
    this.validateApiEndpoints();
    this.validateDeploymentReadiness();

    const isReady = this.generateReport();
    process.exit(isReady ? 0 : 1);
  }
}

// Run validation
if (require.main === module) {
  new VercelDeploymentValidator().run();
}

module.exports = VercelDeploymentValidator;