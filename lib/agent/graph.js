import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentStateAnnotation } from './state.js';

// ==========================================================
// YOUR LANGCHAIN / LANGGRAPH JS AGENT WORKSPACE
// ==========================================================
// 
// This file compiles your LangGraph state graph.
// We have defined three nodes for you:
// 1. researcherNode: Queries news articles and company details.
// 2. analystNode: Performs valuation modeling and ratio analyses.
// 3. criticNode: Reviews financial status and forms final Investment decision.
//
// Below is a fully functional "Simulated Mode" that runs if no OpenAI API Key
// is set, which allows you to inspect and run the visual frontend immediately!
// Replace the code below with your real LangChain and LLM code when ready.

/**
 * 1. RESEARCHER NODE
 * Fetches information about the company.
 * You should use Web Search Tools (e.g. Tavily/Serper) or a custom search here.
 */
async function researcherNode(state) {
  const company = state.companyName;
  const logs = [`[Researcher] Initializing research for "${company}"...`];
  
  // Real implementation example:
  // const searchTool = new TavilySearchResults();
  // const results = await searchTool.invoke(`latest financial news and stock metrics for ${company}`);
  
  if (!process.env.OPENAI_API_KEY) {
    // Simulated behavior for visual testing
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

  // TODO: Add your real LangChain/GoogleGenAI code here!
  logs.push('[Researcher] Real agent run initiated. Put your LangChain search tool calls here.');
  return { logs };
}

/**
 * 2. ANALYST NODE
 * Evaluates the research data and computes financial health metrics.
 */
async function analystNode(state) {
  const logs = [`[Analyst] Analyzing research material for "${state.companyName}"...`];
  
  if (!process.env.OPENAI_API_KEY) {
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

  // TODO: Add your real LangChain code here!
  logs.push('[Analyst] Put your financial math and analysis LLM prompts here.');
  return { logs };
}

/**
 * 3. CRITIC / DECISION NODE
 * Reviews the analyst's findings, lists SWOT, and makes the INVEST/PASS verdict.
 */
async function criticNode(state) {
  const logs = [`[Critic] Evaluating final thesis for "${state.companyName}"...`];
  
  if (!process.env.OPENAI_API_KEY) {
    logs.push(`[Critic] Synthesizing SWOT analysis matrix...`);
    await new Promise((r) => setTimeout(r, 1200));
    logs.push(`[Critic] Reviewing valuation vs growth projections...`);
    await new Promise((r) => setTimeout(r, 1000));
    logs.push(`[Critic] Drafting executive recommendation...`);
    await new Promise((r) => setTimeout(r, 1000));
    
    // Propose standard mock investment decision based on company name characteristics
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

  // TODO: Add your real LangChain code here!
  logs.push('[Critic] Put your logic to synthesize SWOT and output final INVEST/PASS decision here.');
  return { logs };
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
