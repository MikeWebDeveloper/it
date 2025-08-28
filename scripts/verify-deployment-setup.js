#!/usr/bin/env node

/**
 * Vercel Deployment Setup Verification Script
 * Validates the GitHub Actions workflow configuration and required secrets
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function checkFile(filePath, description) {
  try {
    if (fs.existsSync(filePath)) {
      log(GREEN, `✅ ${description} exists`);
      return true;
    } else {
      log(RED, `❌ ${description} missing at: ${filePath}`);
      return false;
    }
  } catch (error) {
    log(RED, `❌ Error checking ${description}: ${error.message}`);
    return false;
  }
}

function checkWorkflowConfiguration() {
  log(BLUE, '\n🔍 Checking GitHub Actions workflow configuration...\n');
  
  const workflowPath = '.github/workflows/deploy.yml';
  if (!checkFile(workflowPath, 'Deploy workflow')) {
    return false;
  }

  try {
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Check for required secrets usage
    const requiredSecrets = [
      'secrets.VERCEL_TOKEN',
      'secrets.VERCEL_ORG_ID', 
      'secrets.VERCEL_PROJECT_ID'
    ];

    log(BLUE, '🔐 Checking required secrets configuration...\n');

    let allSecretsFound = true;
    requiredSecrets.forEach(secret => {
      if (workflowContent.includes(secret)) {
        log(GREEN, `✅ ${secret} is properly configured`);
      } else {
        log(RED, `❌ ${secret} not found in workflow`);
        allSecretsFound = false;
      }
    });

    // Check for environment variable usage (new method)
    const envVarChecks = [
      'VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}',
      'VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}',
      'VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}'
    ];

    log(BLUE, '\n🌍 Checking environment variable configuration...\n');

    let allEnvVarsFound = true;
    envVarChecks.forEach(envVar => {
      if (workflowContent.includes(envVar)) {
        log(GREEN, `✅ Environment variable properly set: ${envVar.split(':')[0]}`);
      } else {
        log(RED, `❌ Environment variable configuration missing: ${envVar}`);
        allEnvVarsFound = false;
      }
    });

    // Check for fixed authentication method (no inline --token)
    const hasInlineToken = workflowContent.includes('--token=${{');
    if (!hasInlineToken) {
      log(GREEN, '✅ Authentication method updated (no inline tokens)');
    } else {
      log(YELLOW, '⚠️  Warning: Inline token usage found - should use environment variables');
    }

    return allSecretsFound && allEnvVarsFound;

  } catch (error) {
    log(RED, `❌ Error reading workflow file: ${error.message}`);
    return false;
  }
}

function checkProjectConfiguration() {
  log(BLUE, '\n📦 Checking project configuration...\n');
  
  let configValid = true;
  
  // Check package.json
  if (checkFile('package.json', 'package.json')) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts['build:vercel']) {
        log(GREEN, '✅ build:vercel script found');
      } else {
        log(RED, '❌ build:vercel script missing in package.json');
        configValid = false;
      }
    } catch (error) {
      log(RED, `❌ Error reading package.json: ${error.message}`);
      configValid = false;
    }
  } else {
    configValid = false;
  }

  // Check vercel.json
  if (checkFile('vercel.json', 'vercel.json configuration')) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
      
      if (vercelConfig.buildCommand === 'npm run build:vercel') {
        log(GREEN, '✅ vercel.json build command properly configured');
      } else {
        log(YELLOW, '⚠️  vercel.json build command might need verification');
      }

      if (vercelConfig.framework === 'nextjs') {
        log(GREEN, '✅ Next.js framework detected in vercel.json');
      }
    } catch (error) {
      log(RED, `❌ Error reading vercel.json: ${error.message}`);
    }
  }

  // Check Next.js configuration
  checkFile('next.config.ts', 'Next.js configuration');
  
  return configValid;
}

function displaySecretsInstructions() {
  log(BLUE, '\n🔑 GitHub Secrets Setup Instructions:\n');
  
  log(YELLOW, '1. Go to your GitHub repository');
  log(YELLOW, '2. Navigate to Settings → Secrets and variables → Actions');
  log(YELLOW, '3. Click "New repository secret" and add these secrets:\n');
  
  const secrets = [
    {
      name: 'VERCEL_TOKEN',
      description: 'Get from https://vercel.com/account/tokens',
      required: true
    },
    {
      name: 'VERCEL_ORG_ID', 
      description: 'Get from your Vercel team/organization settings',
      required: true
    },
    {
      name: 'VERCEL_PROJECT_ID',
      description: 'Get from your project settings in Vercel dashboard',
      required: true
    },
    {
      name: 'SLACK_WEBHOOK',
      description: 'For deployment notifications (optional)',
      required: false
    }
  ];

  secrets.forEach(secret => {
    const status = secret.required ? '(REQUIRED)' : '(OPTIONAL)';
    log(GREEN, `   • ${secret.name} ${status}`);
    log(RESET, `     ${secret.description}\n`);
  });
}

function main() {
  log(BLUE, '🚀 Vercel Deployment Setup Verification\n');
  log(BLUE, '=====================================\n');

  const workflowValid = checkWorkflowConfiguration();
  const configValid = checkProjectConfiguration();

  log(BLUE, '\n📋 Summary:\n');
  
  if (workflowValid && configValid) {
    log(GREEN, '✅ Configuration verification PASSED');
    log(GREEN, '✅ Workflow authentication has been FIXED');
    log(GREEN, '✅ Ready for deployment after adding GitHub secrets\n');
  } else {
    log(RED, '❌ Configuration verification FAILED');
    log(RED, '❌ Please fix the issues above before deploying\n');
  }

  displaySecretsInstructions();

  log(BLUE, '\n🔧 Next Steps:');
  log(YELLOW, '1. Add the required secrets to your GitHub repository');
  log(YELLOW, '2. Push a commit to trigger the workflow');
  log(YELLOW, '3. Monitor deployment in GitHub Actions');
  log(YELLOW, '4. Verify the deployment works correctly');

  process.exit(workflowValid && configValid ? 0 : 1);
}

main();