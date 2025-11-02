import React from 'react';
import Dashboard from './components/Dashboard';
import { AppProvider, useAppContext } from './context/AppContext';
import { CodeIcon } from './components/icons';

const AppHeader = () => {
  const { activeEpisode } = useAppContext();

  return (
    <header className="bg-black/30 backdrop-blur-lg border-b border-cyan-500/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-wider">
              GN AI AUTHORITY
            </h1>
            <p className="text-sm text-gray-400 font-mono">Sovereign Automation Mission Control</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-400">SYSTEM STATUS: OPERATIONAL</span>
          </div>
        </div>
        {activeEpisode && (
          <div className="mt-4 p-2 bg-cyan-900/50 border border-cyan-500/30 rounded-md flex items-center justify-center gap-2 text-xs font-mono text-cyan-300">
            <CodeIcon className="w-4 h-4" />
            <span>ACTIVE CONTEXT: Ep{activeEpisode.ep_number} - {activeEpisode.title} (ID: {activeEpisode.youtubeId})</span>
          </div>
        )}
      </div>
    </header>
  );
};

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen text-gray-100">
        <AppHeader />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Dashboard />
        </main>
        <footer className="text-center py-4 text-gray-500 text-xs border-t border-cyan-500/10 mt-8 font-mono">
          <p>LEGACY++ Civic Ritual Logic Interface v1.0</p>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;