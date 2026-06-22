import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  LineChart, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Percent,
  DollarSign,
  Activity,
  Scale,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchDetail({ runId, onNavigate }) {
  const [run, setRun] = useState(null);
  const [activeNode, setActiveNode] = useState('system');
  const [showLogs, setShowLogs] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
  const terminalEndRef = useRef(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [run?.logs]);

  // Establish SSE stream connection
  useEffect(() => {
    let eventSource = null;

    function connect() {
      // Connect to the Express server API URL
      const host = window.location.origin;
      eventSource = new EventSource(`${host}/api/research/${runId}/stream`);

      eventSource.addEventListener('init', (e) => {
        const initialRun = JSON.parse(e.data);
        setRun(initialRun);
        updateActiveNodeFromLogs(initialRun.logs);
      });

      eventSource.addEventListener('log', (e) => {
        const payload = JSON.parse(e.data);
        setRun(payload.run);
        setActiveNode(payload.step || 'system');
        updateActiveNodeFromLogs(payload.run.logs);
      });

      eventSource.addEventListener('result', (e) => {
        const payload = JSON.parse(e.data);
        setRun(payload.run);
        setActiveNode('complete');
      });

      eventSource.addEventListener('error', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.run) {
          setRun(payload.run);
        }
        setActiveNode('failed');
        setConnectionError(true);
      });

      eventSource.onerror = () => {
        console.error('SSE Stream error occurred.');
        eventSource?.close();
      };
    }

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [runId]);

  // Utility to determine active node based on log string contents
  const updateActiveNodeFromLogs = (logs) => {
    if (!logs || logs.length === 0) return;
    const lastLog = logs[logs.length - 1];
    
    if (lastLog.includes('[Researcher]')) {
      setActiveNode('researcher');
    } else if (lastLog.includes('[Analyst]')) {
      setActiveNode('analyst');
    } else if (lastLog.includes('[Critic]')) {
      setActiveNode('critic');
    }
  };

  const getStatusDisplay = () => {
    if (!run) return 'Initializing...';
    if (run.status === 'running') return 'Agent Researching...';
    if (run.status === 'failed') return 'Workflow Failed';
    return 'Analysis Complete';
  };

  if (!run) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center w-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Retrieving agent run details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#090d16] flex flex-col p-6 md:p-12 overflow-x-hidden w-full items-center justify-between">
      {/* Background radial decorations */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-glow-purple rounded-full pointer-events-none opacity-80 animate-pulse" />
      {run.status === 'completed' && run.decision === 'INVEST' && (
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-glow-emerald rounded-full pointer-events-none opacity-50" />
      )}
      {run.status === 'completed' && run.decision === 'PASS' && (
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-glow-rose rounded-full pointer-events-none opacity-50" />
      )}

      {/* Header */}
      <header className="w-full max-w-6xl flex items-center justify-between z-10 pb-6 border-b border-gray-800/40">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500">RUN_ID: {run.id}</span>
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            run.status === 'completed' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : run.status === 'failed'
              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 animate-pulse'
          }`}>
            {getStatusDisplay()}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl flex-1 z-10 py-10 space-y-10">
        
        {/* Title Details Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block mb-1">
              Investment Target
            </span>
            <h1 className="text-3xl font-extrabold text-white">{run.companyName}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Depth: <span className="uppercase text-slate-300 font-bold">{run.depth}</span> • Created: {new Date(run.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Quick Stats (Only display if completed) */}
          {run.status === 'completed' && run.metrics && (
            <div className="flex flex-wrap gap-4 items-center border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
              <div className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <span className="text-[10px] text-slate-500 block">Market Cap</span>
                <span className="text-sm font-bold text-slate-200">{run.metrics.marketCap || 'N/A'}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <span className="text-[10px] text-slate-500 block">P/E Ratio</span>
                <span className="text-sm font-bold text-slate-200">{run.metrics.peRatio || 'N/A'}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <span className="text-[10px] text-slate-500 block">Rev Growth</span>
                <span className="text-sm font-bold text-slate-200">{run.metrics.revenueGrowth || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* 1. RUNNING STATE: Node Graph Visualizer + Live Terminal */}
        {run.status === 'running' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Flowchart Panel */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between border border-white/5 min-h-[380px] text-left">
              <div>
                <h2 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-6">
                  Agent State Graph
                </h2>
                
                {/* Node flowchart lines */}
                <div className="relative pl-6 space-y-8 border-l border-slate-800">
                  
                  {/* Researcher Node */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                      activeNode === 'researcher' 
                        ? 'bg-indigo-500 border-indigo-400 animate-pulse-glow' 
                        : run.logs.some(l => l.includes('[Researcher]'))
                        ? 'bg-indigo-950 border-indigo-500'
                        : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeNode === 'researcher' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold ${activeNode === 'researcher' ? 'text-indigo-400' : 'text-slate-300'}`}>
                          Researcher Node
                        </h3>
                        <p className="text-[10px] text-slate-500">Querying news & financial records</p>
                      </div>
                    </div>
                  </div>

                  {/* Analyst Node */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                      activeNode === 'analyst' 
                        ? 'bg-indigo-500 border-indigo-400 animate-pulse-glow' 
                        : run.logs.some(l => l.includes('[Analyst]'))
                        ? 'bg-indigo-950 border-indigo-500'
                        : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeNode === 'analyst' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        <LineChart className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold ${activeNode === 'analyst' ? 'text-indigo-400' : 'text-slate-300'}`}>
                          Financial Analyst Node
                        </h3>
                        <p className="text-[10px] text-slate-500">Calculating ratios & health metrics</p>
                      </div>
                    </div>
                  </div>

                  {/* Critic Node */}
                  <div className="relative">
                    <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                      activeNode === 'critic' 
                        ? 'bg-indigo-500 border-indigo-400 animate-pulse-glow' 
                        : run.logs.some(l => l.includes('[Critic]'))
                        ? 'bg-indigo-950 border-indigo-500'
                        : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activeNode === 'critic' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold ${activeNode === 'critic' ? 'text-indigo-400' : 'text-slate-300'}`}>
                          Critic & Decision Node
                        </h3>
                        <p className="text-[10px] text-slate-500">Synthesizing SWOT & final verdict</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 mt-6">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                  <span>Execution in progress...</span>
                </div>
              </div>
            </div>

            {/* Live Terminal Panel */}
            <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col h-[380px] text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold tracking-wider uppercase font-mono">Agent Console Output</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-4 font-mono text-[11px] leading-relaxed text-slate-300 space-y-1.5 pr-2 bg-slate-950/65 p-4 rounded-xl border border-slate-900">
                {run.logs.map((log, index) => (
                  <div 
                    key={index}
                    className={`${
                      log.includes('[Error]') 
                        ? 'text-rose-400' 
                        : log.includes('[System]') 
                        ? 'text-indigo-400' 
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 mr-2">[{index + 1}]</span>
                    {log}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>

          </div>
        )}

        {/* 2. COMPLETED STATE: Premium Verdict Dashboard */}
        {run.status === 'completed' && (
          <div className="space-y-8">
            
            {/* Verdict Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Verdict Card */}
              <div className={`md:col-span-5 glass-panel p-8 rounded-2xl border flex flex-col justify-center items-center text-center relative overflow-hidden ${
                run.decision === 'INVEST' 
                  ? 'border-emerald-500/20 shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/10' 
                  : 'border-rose-500/20 shadow-[0_0_50px_-10px_rgba(244,63,94,0.15)] bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/10'
              }`}>
                {run.decision === 'INVEST' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse-glow-emerald">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase block mb-1">
                      Final Verdict
                    </span>
                    <h2 className="text-5xl font-extrabold text-emerald-400 tracking-tight animate-bounce">INVEST</h2>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                      <XCircle className="w-10 h-10" />
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 tracking-widest uppercase block mb-1">
                      Final Verdict
                    </span>
                    <h2 className="text-5xl font-extrabold text-rose-400 tracking-tight">PASS</h2>
                  </>
                )}

                {/* Score Dial */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="relative w-24 h-24 flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/40">
                    <span className="text-2xl font-black text-white">{run.confidenceScore || 0}%</span>
                    <span className="absolute bottom-2 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                      Confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="md:col-span-7 glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
                      Executive Investment Thesis
                    </h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {run.executiveSummary || 'No executive summary provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-6 pt-4 border-t border-slate-800/60 font-mono">
                  <Info className="w-3.5 h-3.5" />
                  <span>Calculated via Altuni AI Graph nodes utilizing OpenAI GPT models.</span>
                </div>
              </div>

            </div>

            {/* Financial Metrics Cards */}
            {run.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                
                {/* Metric 1 */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 text-left">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Market Cap</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-200">{run.metrics.marketCap || 'N/A'}</span>
                </div>

                {/* Metric 2 */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 text-left">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">P/E Ratio</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-200">{run.metrics.peRatio || 'N/A'}</span>
                </div>

                {/* Metric 3 */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 text-left">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Rev Growth</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-200">{run.metrics.revenueGrowth || 'N/A'}</span>
                </div>

                {/* Metric 4 */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 text-left">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Profit Margin</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-200">{run.metrics.profitMargin || 'N/A'}</span>
                </div>

                {/* Metric 5 */}
                <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 col-span-2 md:col-span-1 text-left">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Debt / Equity</span>
                  </div>
                  <span className="text-base font-extrabold text-slate-200">{run.metrics.debtToEquity || 'N/A'}</span>
                </div>

              </div>
            )}

            {/* SWOT Matrix Card */}
            {run.swot && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left">
                <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 mb-6 pb-2 border-b border-slate-800">
                  SWOT Matrix Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths */}
                  <div className="p-5 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-3">
                      Strengths
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {run.swot.strengths.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-5 rounded-xl bg-rose-500/[0.02] border border-rose-500/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-3">
                      Weaknesses
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {run.swot.weaknesses.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-rose-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-5 rounded-xl bg-indigo-500/[0.02] border border-indigo-500/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-3">
                      Opportunities
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {run.swot.opportunities.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="p-5 rounded-xl bg-amber-500/[0.02] border border-amber-500/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-3">
                      Threats
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {run.swot.threats.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {/* Collapsible Console Archive */}
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full px-6 py-4 flex justify-between items-center bg-slate-900/30 hover:bg-slate-900/50 transition-colors border-b border-slate-800/80 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold tracking-wider uppercase font-mono text-slate-300">
                    Agent Log History (Archived)
                  </span>
                </div>
                {showLogs ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              <AnimatePresence>
                {showLogs && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 font-mono text-[10px] leading-relaxed text-slate-300 space-y-1.5 bg-slate-950 p-4 max-h-[300px] overflow-y-auto text-left">
                      {run.logs.map((log, index) => (
                        <div 
                          key={index}
                          className={`${
                            log.includes('[Error]') 
                              ? 'text-rose-400' 
                              : log.includes('[System]') 
                              ? 'text-indigo-400' 
                              : 'text-slate-300'
                          }`}
                        >
                          <span className="text-slate-600 mr-2">[{index + 1}]</span>
                          {log}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

        {/* 3. FAILED STATE: Warnings & Resets */}
        {run.status === 'failed' && (
          <div className="glass-panel p-8 rounded-2xl border border-rose-500/20 bg-rose-950/5 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-10 h-10" />
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-slate-200">Execution Error Encountered</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                The multi-agent graph aborted due to a critical node failure. Ensure your API keys and parameters are correctly configured.
              </p>
            </div>

            <div className="w-full text-left font-mono text-[10px] text-rose-400 bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto whitespace-pre-wrap">
              Error Message: {run.error || 'Unknown workflow issue.'}
            </div>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto z-10 py-6 border-t border-gray-800/40 flex justify-between items-center text-[10px] text-slate-600">
        <span>PROMPT_TOOL • InsideIIM Assignment</span>
        <span>React + Express + LangGraph.js</span>
      </footer>
    </div>
  );
}
