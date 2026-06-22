import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import ResearchDetail from './ResearchDetail';

function App() {
  const [view, setView] = useState('dashboard');
  const [activeRunId, setActiveRunId] = useState(null);

  // URL parsing router on mount
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/research\/(.+)$/);
    if (match) {
      setActiveRunId(match[1]);
      setView('research');
    } else {
      setView('dashboard');
    }

    // Handle popstate for browser back and forward navigation
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const currentMatch = currentPath.match(/^\/research\/(.+)$/);
      if (currentMatch) {
        setActiveRunId(currentMatch[1]);
        setView('research');
      } else {
        setActiveRunId(null);
        setView('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (newView, runId = null) => {
    setView(newView);
    setActiveRunId(runId);
    if (newView === 'research' && runId) {
      window.history.pushState(null, '', `/research/${runId}`);
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] text-[#f1f5f9] flex flex-col justify-start items-center">
      {view === 'dashboard' ? (
        <Dashboard onNavigate={handleNavigate} />
      ) : (
        <ResearchDetail runId={activeRunId} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
