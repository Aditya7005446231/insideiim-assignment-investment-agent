import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const sourceDir = process.cwd();
const tempDir = path.join(sourceDir, 'temp_submission');
const zipName = 'InsideIIM_Investment_Agent_Submission.zip';
const zipPath = path.join(sourceDir, zipName);

// Directories and files to include
const includeList = [
  'lib',
  'frontend',
  'scripts',
  'server.js',
  'package.json',
  'package-lock.json',
  '.env',
  'README.md',
  'workflow_explanation.txt',
  'AI_AGENT_CHAT_LOGS.md',
  'assignment_details.txt',
  'SUBMISSION_LINK_ANSWER.txt'
];

function cleanCopy(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    // Exclude node_modules and .git
    if (src.endsWith('node_modules') || src.endsWith('.git')) return;
    
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      cleanCopy(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

try {
  // 1. Remove old temp dir and old zip if exists
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  console.log('Preparing clean submission directory...');
  fs.mkdirSync(tempDir);

  // 2. Copy allowed files
  includeList.forEach(item => {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(tempDir, item);
    if (fs.existsSync(srcPath)) {
      cleanCopy(srcPath, destPath);
    }
  });

  console.log('Compressing files into zip archive...');
  // Use PowerShell Compress-Archive for Windows compat
  const cmd = `powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`;
  execSync(cmd);

  // 3. Remove temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`\nSuccessfully created submission zip file at: ${zipPath}`);
} catch (error) {
  console.error('Error during zip packaging:', error.message);
}
