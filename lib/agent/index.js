import { agentGraph } from './graph.js';
import { getRun, saveRun } from '../db.js';

export async function runResearchAgent(runId, onUpdate) {
  const run = getRun(runId);
  if (!run) {
    onUpdate('error', { message: 'Run not found' });
    return;
  }

  try {
    // 1. Mark run as running
    run.status = 'running';
    run.logs.push('[System] Starting AI Investment Agent workflow...');
    saveRun(run);
    onUpdate('log', { step: 'system', message: 'Starting AI Investment Agent workflow...', run });

    // 2. Stream graph execution
    const stream = await agentGraph.stream(
      {
        companyName: run.companyName,
        depth: run.depth,
        logs: [],
        researchData: [],
        financialAnalysis: '',
        criticReview: '',
        decision: null,
        confidenceScore: 0,
        executiveSummary: '',
        swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        metrics: {}
      },
      { streamMode: 'updates' }
    );

    let currentState = { ...run };

    for await (const chunk of stream) {
      // Chunk format: { [nodeName]: { ...stateProperties } }
      const nodeName = Object.keys(chunk)[0];
      const nodeUpdates = chunk[nodeName];

      currentState.logs = currentState.logs.concat(nodeUpdates.logs || []);
      
      // Update fields depending on the node
      if (nodeName === 'researcher') {
        currentState.logs.push('[System] Researcher node completed execution.');
      } else if (nodeName === 'analyst') {
        currentState.metrics = { ...currentState.metrics, ...nodeUpdates.metrics };
        currentState.financialAnalysis = nodeUpdates.financialAnalysis;
        currentState.logs.push('[System] Financial Analyst node completed execution.');
      } else if (nodeName === 'critic') {
        currentState.decision = nodeUpdates.decision;
        currentState.confidenceScore = nodeUpdates.confidenceScore;
        currentState.executiveSummary = nodeUpdates.executiveSummary;
        currentState.swot = nodeUpdates.swot;
        currentState.logs.push('[System] Critic node completed execution.');
      }

      // Save intermediate progress
      saveRun(currentState);
      onUpdate('log', { 
        step: nodeName, 
        message: `Completed step: ${nodeName}`, 
        run: currentState 
      });
    }

    // 3. Mark completed
    currentState.status = 'completed';
    currentState.completedAt = new Date().toISOString();
    currentState.logs.push('[System] AI Investment Agent workflow completed successfully.');
    saveRun(currentState);
    
    onUpdate('result', { run: currentState });
  } catch (error) {
    console.error('Error running agent graph:', error);
    
    // Save error state
    const failedRun = getRun(runId);
    if (failedRun) {
      failedRun.status = 'failed';
      failedRun.error = error.message || String(error);
      failedRun.logs.push(`[Error] Agent execution failed: ${failedRun.error}`);
      failedRun.completedAt = new Date().toISOString();
      saveRun(failedRun);
      onUpdate('error', { message: failedRun.error, run: failedRun });
    } else {
      onUpdate('error', { message: error.message || String(error) });
    }
  }
}
