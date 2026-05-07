#!/usr/bin/env node

/**
 * Script to set environment variables in Vercel
 * Usage: node scripts/set-vercel-env.js ADMIN_API_KEY your_api_key_here
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function setVercelEnvVar(key, value) {
  try {
    console.log(`Setting ${key} in Vercel environment variables...`);
    
    // Set environment variable in Vercel
    const command = `vercel env add ${key} --force`;
    const child = require('child_process').spawn(command, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send the value to stdin
    child.stdin.write(value);
    child.stdin.end();

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Successfully set ${key} in Vercel`);
        console.log('Note: It may take a few minutes for the environment variable to take effect.');
      } else {
        console.error(`❌ Failed to set ${key}:`);
        console.error(errorOutput);
        
        // Fallback instructions
        console.log('\n📋 Manual setup instructions:');
        console.log('1. Run: vercel env add ADMIN_API_KEY');
        console.log('2. Choose the environment (production, preview, development)');
        console.log('3. Enter your admin API key when prompted');
      }
    });

  } catch (error) {
    console.error(`❌ Error setting ${key}:`, error.message);
    
    console.log('\n📋 Manual setup instructions:');
    console.log('1. Make sure you have Vercel CLI installed: npm i -g vercel');
    console.log('2. Login to Vercel: vercel login');
    console.log('3. Run: vercel env add ADMIN_API_KEY');
    console.log('4. Choose the environment (production, preview, development)');
    console.log('5. Enter your admin API key when prompted');
  }
}

function generateSecureKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  console.log('🔐 Vercel Admin API Key Setup');
  console.log('================================\n');

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/set-vercel-env.js ADMIN_API_KEY [your_key]');
    console.log('Or run without arguments for interactive setup\n');
    
    // Interactive mode
    rl.question('Do you want to generate a new secure admin API key? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        const newKey = generateSecureKey();
        console.log(`\nGenerated admin API key: ${newKey}`);
        console.log('Save this key securely!\n');
        
        rl.question('Press Enter to set this key in Vercel...', () => {
          setVercelEnvVar('ADMIN_API_KEY', newKey);
          rl.close();
        });
      } else {
        rl.question('Enter your admin API key: ', (key) => {
          if (key.trim()) {
            setVercelEnvVar('ADMIN_API_KEY', key.trim());
          } else {
            console.log('❌ No key provided. Exiting.');
          }
          rl.close();
        });
      }
    });
  } else {
    const key = args[0];
    const value = args[1] || generateSecureKey();
    
    if (key === 'ADMIN_API_KEY') {
      if (!args[1]) {
        console.log(`Generated admin API key: ${value}`);
        console.log('Save this key securely!\n');
      }
      setVercelEnvVar(key, value);
    } else {
      console.log('❌ This script is specifically for setting ADMIN_API_KEY');
      console.log('Usage: node scripts/set-vercel-env.js ADMIN_API_KEY [your_key]');
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setVercelEnvVar, generateSecureKey };
