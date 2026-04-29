import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Background } from './components/Background';
import { Dashboard } from './components/Dashboard';
import { AppPage } from './components/AppPage';

const App: React.FC = () => {
  return (
    <div className="relative min-h-screen text-slate-200 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-100">
      <Background />
      <Navbar />
      <main className="mx-auto max-w-7xl">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/app/:appId" element={<AppPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
