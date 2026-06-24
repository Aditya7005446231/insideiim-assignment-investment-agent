import fs from 'fs';
import path from 'path';

const TRANSCRIPT_PATH = 'C:\\Users\\Aditya Rai\\.gemini\\antigravity-ide\\brain\\84667489-23c7-46ea-98e7-66cb1e1b2404\\.system_generated\\logs\\transcript.jsonl';
const OUTPUT_PATH = path.join(process.cwd(), 'AI_AGENT_CHAT_LOGS.md');

function parseTranscript() {
  if (!fs.existsSync(TRANSCRIPT_PATH)) {
    console.error('Transcript file not found at:', TRANSCRIPT_PATH);
    process.exit(1);
  }

  const lines = fs.readFileSync(TRANSCRIPT_PATH, 'utf-8').split('\n');
  let markdown = '# AI Pair Programming Chat Transcript & Logs\n\n';
  markdown += 'This document contains the chronological interaction history between the developer and the AI Assistant (Antigravity) while building, planning, and debugging the AI Investment Research Agent.\n\n';
  
  let turnNumber = 1;

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const data = JSON.parse(line);
      
      // User message
      if (data.type === 'USER_INPUT' && data.content) {
        markdown += `### Turn ${turnNumber++}: USER Input\n`;
        markdown += `**Timestamp:** \`${new Date().toISOString()}\`  \n\n`;
        markdown += `> ${data.content.trim().replace(/\n/g, '\n> ')}\n\n`;
        markdown += '---\n\n';
      }
      
      // AI assistant responses
      if (data.type === 'PLANNER_RESPONSE' && data.content) {
        // Exclude internal tools detail unless interesting
        markdown += `### Turn ${turnNumber++}: AI ASSISTANT Response\n`;
        markdown += `**Timestamp:** \`${new Date().toISOString()}\`  \n\n`;
        markdown += `${data.content.trim()}\n\n`;
        markdown += '---\n\n';
      }
    } catch (err) {
      // Ignore json line parse errors
    }
  }

  fs.writeFileSync(OUTPUT_PATH, markdown, 'utf-8');
  console.log('Successfully generated AI_AGENT_CHAT_LOGS.md at:', OUTPUT_PATH);
}

parseTranscript();
