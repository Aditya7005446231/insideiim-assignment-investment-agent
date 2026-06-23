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
    <div className="relative min-h-screen flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden bg-[#090d16] w-full">
      {/* Background glow graphics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-glow-purple rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-glow-emerald rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center z-10 py-4 border-b border-gray-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              AI Powered
            </span>
            <span className="text-[10px] block font-mono text-indigo-400 tracking-widest mt-[-2px] uppercase">
              Investment Agent
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Altuni AI Labs Spec</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto z-10 py-12">

        {/* Left Side: Search & Initiate Form */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                Investment Research Agent
              </span>
            </h1>
            <p className="text-slate-400 mt-4 max-w-lg leading-relaxed text-sm md:text-base">
              Harness multi-agent graph workflows using <strong className="text-slate-300">LangGraph.js</strong>.
              Our agent searches market reports, calculates financial ratios, and builds a comprehensive SWOT analysis to deliver an actionable Investment thesis.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 glass-panel p-6 md:p-8 rounded-2xl relative shadow-2xl border border-white/10"
          >
            <form onSubmit={handleStartResearch} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Company Name or Ticker
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Research Depth
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDepth('quick')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${depth === 'quick'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Quick Analysis
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepth('deep')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${depth === 'deep'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Deep Research
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 px-1 font-mono">
                  {depth === 'quick'
                    ? '• Rapid search, evaluates key ratios & returns direct metrics (15-20s)'
                    : '• Multi-source retrieval, processes secondary sources & details risks (45-60s)'}
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initiating Graph Nodes...</span>
                  </>
                ) : (
                  <>
                    <span>Run Investment Agent</span>
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl h-[480px] flex flex-col shadow-2xl border border-white/5"
          >
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <History className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">
                Recent Research Runs
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3.5">
              {loadingRuns ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : runs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <FileText className="w-10 h-10 text-slate-600 mb-2" />
                  <span className="text-slate-400 text-xs font-semibold">No runs yet</span>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                    Enter a company name on the left to fire up your first investment graph.
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {runs.map((run, index) => (
                    <motion.div
                      key={run.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onNavigate('research', run.id)}
                      className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-900/90 border border-slate-800/60 hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-1 pr-2 max-w-[70%] text-left">
                        <h3 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                          {run.companyName}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="uppercase font-semibold tracking-wider text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
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
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-semibold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 block" />
                            <span>Running</span>
                          </div>
                        )}
                        {run.status === 'failed' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Failed</span>
                          </div>
                        )}
                        {run.status === 'completed' && run.decision === 'INVEST' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>INVEST</span>
                          </div>
                        )}
                        {run.status === 'completed' && run.decision === 'PASS' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>PASS</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl z-10 py-6 border-t border-gray-800/40 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} InsideIIM × Altuni AI Labs take-home assignment.</span>
        <div className="flex gap-4">
          <span className="font-mono text-slate-600">Stack: React + Express + LangGraph.js</span>
        </div>
      </footer>
    </div>
  );
}
