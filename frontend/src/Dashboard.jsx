import { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  History,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard({ onNavigate }) {
  const [companyName, setCompanyName] = useState('');
  const [depth, setDepth] = useState('quick');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch past research runs
  useEffect(() => {
    async function fetchRuns() {
      try {
        const res = await fetch('/api/research');
        const json = await res.json();
        if (json.success) {
          setRuns(json.data);
        }
      } catch (err) {
        console.error('Failed to load past runs:', err);
      } finally {
        setLoadingRuns(false);
      }
    }
    fetchRuns();
  }, []);

  const handleStartResearch = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          depth,
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.id) {
        onNavigate('research', json.data.id);
      } else {
        setErrorMessage(json.error || 'Something went wrong initiating the agent.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMessage('Network error starting research workflow.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-[#0b0f19] w-full">
      {/* Background glow graphics */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-glow-purple rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-glow-emerald rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center z-10 py-5 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Altuni AI
            </span>
            <span className="text-[9px] block font-mono text-indigo-400/80 tracking-widest mt-[-2px] uppercase font-bold">
              Investment Agent
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">LangGraph Orchestrated</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto z-10 py-12">

        {/* Left Side: Search & Initiate Form */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Institutional Grade <br />
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-white bg-clip-text text-transparent">
                Investment Research
              </span>
            </h1>
            <p className="text-slate-400 mt-4 max-w-lg leading-relaxed text-sm md:text-base">
              Run autonomous AI analysts configured to perform multi-agent research. 
              Our agents scrape news, extract crucial valuation metrics, compile a SWOT grid, and deliver structured investment reports.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-8 glass-panel p-6 md:p-8 rounded-2xl relative shadow-2xl border border-white/5"
          >
            <form onSubmit={handleStartResearch} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Company Name or Stock Ticker
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tesla, Apple, Reliance Industries..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              {/* Research Depth Switcher */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Research Rigor
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => setDepth('quick')}
                    className={`py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${depth === 'quick'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Quick Analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepth('deep')}
                    className={`py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${depth === 'deep'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Deep Research
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 px-1 font-mono">
                  {depth === 'quick'
                    ? '• Standard extraction, key metrics parsing (~15s)'
                    : '• Extended multi-source retrieval & deep risk criticism (~45s)'}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-center">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !companyName.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-indigo-500/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initiating Graph Nodes...</span>
                  </>
                ) : (
                  <>
                    <span>Run Research Pipeline</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Side: History & Recent Runs */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-panel p-6 rounded-2xl h-[480px] flex flex-col shadow-2xl border border-white/5"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/60">
              <History className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-300">
                Recent Investment Runs
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3">
              {loadingRuns ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : runs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <FileText className="w-9 h-9 text-slate-600 mb-2" />
                  <span className="text-slate-400 text-xs font-semibold">No active runs yet</span>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                    Enter a target name to trigger the research nodes.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {runs.map((run, index) => {
                    // Compute border classes depending on status
                    let borderLeftColor = 'border-l-slate-700';
                    if (run.status === 'running') borderLeftColor = 'border-l-indigo-500';
                    else if (run.status === 'failed') borderLeftColor = 'border-l-rose-500';
                    else if (run.decision === 'INVEST') borderLeftColor = 'border-l-emerald-500';
                    else if (run.decision === 'PASS') borderLeftColor = 'border-l-amber-500';

                    return (
                      <motion.div
                        key={run.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => onNavigate('research', run.id)}
                        className={`p-4 rounded-xl bg-slate-900/25 hover:bg-slate-900/60 border border-slate-800/40 border-l-4 ${borderLeftColor} transition-all cursor-pointer flex items-center justify-between group`}
                      >
                        <div className="space-y-1.5 pr-2 max-w-[70%] text-left">
                          <h3 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                            {run.companyName}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="uppercase font-bold tracking-wider text-[8px] bg-slate-850 px-1.5 py-0.5 rounded text-slate-300">
                              {run.depth}
                            </span>
                            <span>
                              {new Date(run.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {run.status === 'running' && (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-bold animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 block" />
                              <span>Running</span>
                            </div>
                          )}
                          {run.status === 'failed' && (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-bold">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>Failed</span>
                            </div>
                          )}
                          {run.status === 'completed' && run.decision === 'INVEST' && (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>INVEST</span>
                            </div>
                          )}
                          {run.status === 'completed' && run.decision === 'PASS' && (
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-bold">
                              <CheckCircle className="w-3 h-3 text-amber-400" />
                              <span>PASS</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl z-10 py-6 border-t border-slate-800/40 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} InsideIIM × Altuni AI Labs take-home assignment.</span>
        <div className="flex gap-4">
          <span className="font-mono text-slate-600">Stack: React + Express + LangGraph.js</span>
        </div>
      </footer>
    </div>
  );
}
