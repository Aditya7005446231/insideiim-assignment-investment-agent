import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'runs');

// Ensure database directory exists
function ensureDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function saveRun(run) {
  ensureDirectory();
  const filePath = path.join(DATA_DIR, `${run.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(run, null, 2), 'utf-8');
}

export function getRun(id) {
  ensureDirectory();
  const filePath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading run ${id}:`, error);
    return null;
  }
}

export function listRuns() {
  ensureDirectory();
  try {
    const files = fs.readdirSync(DATA_DIR);
    const runs = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const id = path.basename(file, '.json');
        const run = getRun(id);
        if (run) {
          runs.push(run);
        }
      }
    }
    
    // Sort by createdAt descending (newest first)
    return runs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error listing runs:', error);
    return [];
  }
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
