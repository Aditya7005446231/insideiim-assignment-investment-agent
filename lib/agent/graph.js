import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentStateAnnotation } from './state.js';
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';

// Initialize the LLM (using OpenRouter if key is present, otherwise standard OpenAI)
const model = new ChatOpenAI({
  configuration: {
    baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined,
  },
  openAIApiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || 'placeholder-key',
  modelName: process.env.MODEL_NAME || (process.env.OPENROUTER_API_KEY ? 'openrouter/free' : 'gpt-4o-mini'),
  temperature: 0.2
});

// Helper check to see if we should run in Simulated Mock Mode
function isSimulationMode() {
  return !process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY;
}

/**
 * 1. RESEARCHER NODE
 * Gathers news and data. Uses Tavily Search API if key is present,
 * otherwise falls back to LLM internal knowledge to compile recent reports.
 */
async function researcherNode(state) {
  const company = state.companyName;
  const logs = [`[Researcher] Initializing research for "${company}"...`];

  if (isSimulationMode()) {
    logs.push(`[Researcher] Querying Web Search for "${company}" financial news...`);
    await new Promise((r) => setTimeout(r, 1500));
    logs.push(`[Researcher] Found recent articles: Q3 revenue growth up, expansion in global markets.`);
    logs.push(`[Researcher] Retrieving stock ticker info & market cap...`);
    await new Promise((r) => setTimeout(r, 1000));

    return {
      researchData: [
        `Company: ${company}`,
        `Latest news: Strong product demand, solid balance sheet, potential supply chain risks.`,
        `Market cap is approximately $85B. P/E ratio sits at 24.5.`
      ],
      logs
    };
  }

  // Real LLM / Search Implementation
  try {
    if (process.env.SERPER_API_KEY) {
      logs.push(`[Researcher] Querying Tavily Search API for "${company}" financial news...`);
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.SERPER_API_KEY,
          query: `${company} latest news stock performance earnings financial ratios valuation`,
        })
      });
      const data = await response.json();
      const resultsText = data.results.map(r => `Source: ${r.title}\nContent: ${r.content}`).join('\n\n');
      logs.push(`[Researcher] Tavily search complete.`);
      return {
        researchData: [resultsText],
        logs
      };
    } else {
      // Fallback: Ask LLM to generate research report based on its training data
      logs.push(`[Researcher] No TAVILY_API_KEY found. Fetching LLM historical knowledge report for "${company}"...`);
      const prompt = `Provide a detailed research report on the company "${company}". Include recent known financial performance, stock ticker, general valuation multiples, major products, and competitors. Keep it factual.`;
      const response = await model.invoke(prompt);
      logs.push(`[Researcher] Knowledge retrieval report generated.`);
      return {
        researchData: [response.content],
        logs
      };
    }
  } catch (error) {
    logs.push(`[Error] Researcher node encountered an issue: ${error.message}`);
    throw error;
  }
}

/**
 * 2. ANALYST NODE
 * Evaluates the research data and computes financial health metrics.
 */
async function analystNode(state) {
  const logs = [`[Analyst] Analyzing research material for "${state.companyName}"...`];

  if (isSimulationMode()) {
    logs.push(`[Analyst] Parsing raw financial metrics...`);
    await new Promise((r) => setTimeout(r, 1500));
    logs.push(`[Analyst] Calculating valuation ratios (P/E, Debt/Equity, margins)...`);
    await new Promise((r) => setTimeout(r, 1200));
    logs.push(`[Analyst] Financial modeling complete: strong liquidity, moderate debt, positive cash flow.`);

    return {
      financialAnalysis: `Financial health for ${state.companyName} is sound. Revenue growth is stable at 12% YoY, and profit margins are at a healthy 18%. Debt-to-equity is low (0.45).`,
      metrics: {
        peRatio: '24.5',
        marketCap: '$85.4 Billion',
        revenueGrowth: '12% YoY',
        profitMargin: '18%',
        debtToEquity: '0.45'
      },
      logs
    };
  }

  // Real LLM / Search Implementation
  try {
    logs.push(`[Analyst] Running financial extraction model...`);
    const prompt = `You are a financial analyst. Based on this research data, compile a summary of the company's financial health, calculate/extract metrics, and return a JSON object.
    
    Research Data:
    ${state.researchData.join('\n\n')}
    
    Respond ONLY with a JSON object in this exact format (do not wrap in markdown json blocks, just return raw JSON):
    {
      "analysisText": "Your paragraph explaining valuation, revenue, and margins",
      "metrics": {
        "peRatio": "e.g. 25.1",
        "marketCap": "e.g. $1.2 Trillion",
        "revenueGrowth": "e.g. 15% YoY",
        "profitMargin": "e.g. 12%",
        "debtToEquity": "e.g. 0.35"
      }
    }`;

    const response = await model.invoke(prompt);
    const cleanJSON = response.content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJSON);

    logs.push(`[Analyst] Financial analysis complete.`);
    return {
      financialAnalysis: result.analysisText,
      metrics: result.metrics,
      logs
    };
  } catch (error) {
    logs.push(`[Error] Analyst node failed: ${error.message}`);
    throw error;
  }
}

/**
 * 3. CRITIC / DECISION NODE
 * Reviews the analyst's findings, lists SWOT, and makes the INVEST/PASS verdict.
 */
async function criticNode(state) {
  const logs = [`[Critic] Evaluating final thesis for "${state.companyName}"...`];

  if (isSimulationMode()) {
    logs.push(`[Critic] Synthesizing SWOT analysis matrix...`);
    await new Promise((r) => setTimeout(r, 1200));
    logs.push(`[Critic] Reviewing valuation vs growth projections...`);
    await new Promise((r) => setTimeout(r, 1000));
    logs.push(`[Critic] Drafting executive recommendation...`);
    await new Promise((r) => setTimeout(r, 1000));

    const score = Math.floor(Math.random() * 40) + 55; // 55 to 95
    const decision = score >= 70 ? 'INVEST' : 'PASS';

    return {
      decision,
      confidenceScore: score,
      executiveSummary: `We recommend a "${decision}" on ${state.companyName}. The company exhibits robust fundamentals with a solid balance sheet and low debt. However, valuation is slightly high, requiring high confidence in their long-term moat.`,
      swot: {
        strengths: ['High profit margins', 'Strong liquidity reserves', 'Resilient customer base'],
        weaknesses: ['High valuation multiple', 'Regulatory risks in overseas markets'],
        opportunities: ['Emerging market expansion', 'Product line extension via AI technologies'],
        threats: ['Increased sector competition', 'Macroeconomic inflation pressures']
      },
      logs: logs.concat([`[Critic] Verdict issued: ${decision} (Confidence: ${score}%)`])
    };
  }

  // Real LLM / Search Implementation
  try {
    logs.push(`[Critic] Drafting SWOT and making investment decision...`);
    const prompt = `You are an investment critic. Review the analyst findings and decide whether to INVEST or PASS. Provide a confidence score (0-100), SWOT analysis matrix, and executive thesis summary.
    
    Company: ${state.companyName}
    Financial Analysis: ${state.financialAnalysis}
    Metrics: ${JSON.stringify(state.metrics)}
    
    Respond ONLY with a JSON object in this exact format (do not wrap in markdown json blocks, just return raw JSON):
    {
      "decision": "INVEST" or "PASS",
      "confidenceScore": 85, 
      "executiveSummary": "Your thesis rationale summary...",
      "swot": {
        "strengths": ["list item 1", "list item 2"],
        "weaknesses": ["list item 1"],
        "opportunities": ["list item 1"],
        "threats": ["list item 1"]
      }
    }`;

    const response = await model.invoke(prompt);
    const cleanJSON = response.content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJSON);

    logs.push(`[Critic] Verdict issued: ${result.decision} (Confidence: ${result.confidenceScore}%)`);
    return {
      decision: result.decision,
      confidenceScore: result.confidenceScore,
      executiveSummary: result.executiveSummary,
      swot: result.swot,
      logs
    };
  } catch (error) {
    logs.push(`[Error] Critic node failed: ${error.message}`);
    throw error;
  }
}

// Build and compile the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode('researcher', researcherNode)
  .addNode('analyst', analystNode)
  .addNode('critic', criticNode)
  .addEdge(START, 'researcher')
  .addEdge('researcher', 'analyst')
  .addEdge('analyst', 'critic')
  .addEdge('critic', END);

export const agentGraph = workflow.compile();
