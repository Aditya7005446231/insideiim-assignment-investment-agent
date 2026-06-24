# AI-Powered Investment Research Agent (LangGraph.js)

An institutional-grade, multi-agent research dashboard built with **React (Vite)**, **Express**, and **LangGraph.js**. The agent autonomously conducts market research, compiles key financial ratios, builds a detailed SWOT matrix, and delivers an actionable investment recommendation (*INVEST* or *PASS*) with a confidence score.

---

## 1. Overview
This project was developed for the **AI Product Development Engineer (Intern) Take-Home Assignment** for InsideIIM × Altuni AI Labs.

The agent automates the intensive workflow of an investment analyst:
1. **Scrapes/Retrieves** news, market cap, and valuation indicators.
2. **Standardizes & Models** financial ratios (P/E ratio, Margins, Debt/Equity).
3. **Criticizes & Verdicts** the asset from a conservative investment thesis, compiling a SWOT grid.
4. **Streams progress in real-time** via Server-Sent Events (SSE) to a gorgeous dashboard featuring custom SVG gauges and an active timeline.

---

## 2. How to Run It

### Prerequisites
* **Node.js** (v18 or higher recommended)
* Optional: **Serper API Key** (for live Google searches)
* Optional: **OpenRouter API Key** or **OpenAI API Key** (for model generation)
  * *Note: If no API keys are provided, the system automatically runs in **Simulation Mode** using pre-configured mock research workflows so you can evaluate the dashboard instantly.*

### Installation & Setup

1. **Extract/Clone the repository** and navigate to the project root:
   ```bash
   cd "InsideIIM Assignment"
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   
   # Optional: For Live LLM Actions (OpenRouter or standard OpenAI API)
   OPENROUTER_API_KEY=your-openrouter-key-here
   OPENAI_API_KEY=your-openai-key-here
   
   # Optional: For live Web Searches
   SERPER_API_KEY=your-serper-key-here
   ```

3. **Install dependencies** for both Backend and Frontend:
   ```bash
   npm run install-all
   ```

4. **Build the Frontend**:
   ```bash
   npm run build-frontend
   ```

5. **Start the Application**:
   ```bash
   npm start
   ```
   Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 3. How It Works (Architecture & Design)

The project leverages a **Stateful Multi-Agent Graph** powered by LangGraph.js:

```
[User Request] ➔ Dashboard ➔ POST /api/research 
                                   │
                                   ▼
                   LangGraph StateGraph Execution
                                   │
   ┌───────────────────────────────┴───────────────────────────────┐
   │                                                               │
   ▼ (Node 1)                                                      ▼ (Node 2)
[Researcher Node] ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ ➔ [Financial Analyst Node]
• Live Search (Serper API)                                  • Evaluates news
• Or Fallback LLM Retrieval                                 • Extracts Metrics (JSON)
                                                                   │
                                                                   ▼ (Node 3)
                                                            [Critic Node]
                                                            • SWOT Analysis
                                                            • Invest/Pass Verdict
                                                            • Confidence Score
                                                                   │
                                                                   ▼
                                                            [Graph Terminated]
```

### Key Components

* **State Annotation (`lib/agent/state.js`)**:
  Defines the shared state properties (`companyName`, `researchData`, `metrics`, `logs`, etc.) and specifies reducer handlers (e.g., appending logs/data rather than overwriting).
* **The Nodes (`lib/agent/graph.js`)**:
  1. `researcherNode`: Searches Serper API or retrieves historical data using LLM.
  2. `analystNode`: Formulates structured prompting telling the LLM to return a strict JSON payload with P/E ratios, revenue growth, margins, and analysis text.
  3. `criticNode`: Acts as a conservative critic to generate SWOT elements and final decision.
* **Server-Sent Events (SSE) Streaming (`server.js` & `lib/agent/index.js`)**:
  Rather than polling the backend, the server opens a persistent HTTP connection (`/api/research/:id/stream`) and broadcasts node progress instantly.
* **Real-time Frontend Dashboard (`frontend/src/`)**:
  * **Dashboard.jsx**: Initiates research runs, displays status badges, and lists past runs with a clean vertical color strip representing outcomes.
  * **ResearchDetail.jsx**: Features a linear node timeline, a glowing terminal-style log output, and custom **SVG Progress rings** that visually show the agent confidence dial.

---

## 4. Key Decisions & Trade-Offs

* **Vite React instead of Next.js for Frontend**:
  Using a decoupled Vite frontend + Express backend makes the code extremely modular, fast to build, and simplifies SSE broadcasting which is occasionally tricky in Next.js Server Actions.
* **Simulation Mode Fallback**:
  We added a mock simulator that fires if no keys are found in `.env`. This allows immediate evaluators to experience the visual transitions, SSE timeline glows, and finished UI layout without running into credit/quota limits.
* **Serper API over Tavily**:
  Serper was selected for search retrieval as it has excellent API performance and straightforward pricing structure.
* **Strict JSON Extraction via Prompt Engineering**:
  Instead of utilizing complex JSON schema parsing libraries, we engineered structural system prompts and sanitization routines to ensure models reliably yield raw JSON payloads.

---

## 5. Example Run Output

### Target: **Nike** (Completed Run)
* **ID**: `1782230151425-k9swtcy`
* **Verdict**: **INVEST**
* **Confidence**: **85%**
* **Metrics**:
  * **Market Cap**: `$260 Billion`
  * **P/E Ratio**: `27.8`
  * **Revenue Growth**: `9.2% YoY`
  * **Profit Margin**: `9.0%`
  * **Debt to Equity**: `1.0`
* **SWOT Matrix**:
  * *Strengths*: Strong brand equity and market leadership, consistent YoY revenue growth, robust free cash flow ($5.8 Billion).
  * *Weaknesses*: Premium P/E ratio may limit upside if growth expectations are missed.
  * *Opportunities*: Expansion in emerging markets and direct-to-consumer digital channels.
  * *Threats*: Intensifying sector competition; global macroeconomic downturns.

---

## 6. What We Would Improve with More Time
1. **Parallel Nodes**: Run the researcher and a sector analyst in parallel using LangGraph branching to combine macro-trends with micro-company metrics.
2. **Chart Integrations**: Pull historical stock chart data from Yahoo Finance and plot interactive graphs on the metrics section.
3. **Export Reports**: Generate downloadable PDF reports summarizing the generated thesis, SWOT grid, and key ratios.

---

## 7. LLM Chat Transcript (Bonus Points)
As mandated by the instructions, this project was developed in close collaboration with an AI pair programmer.
The entire session log containing plans, code, and transcripts is saved in:
* **[AI_AGENT_CHAT_LOGS.md](file:///c:/Users/Aditya%20Rai/OneDrive/Desktop/InsideIIM%20Assignment/AI_AGENT_CHAT_LOGS.md)**
Please include this file in the evaluation package to verify the thought process and developer-AI synergy.
