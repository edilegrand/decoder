import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Background } from './components/Background';
import { Dashboard } from './components/Dashboard';
import { AppPage } from './components/AppPage';
import { PublicDashboard } from './components/PublicDashboard';
import { LandingPage } from './components/LandingPage';

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-200 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-100">
      <Background />
      <Navbar />
      <main className="mx-auto max-w-7xl">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/app/:appId" element={<AppPage />} />
          <Route path="/:nickname" element={<PublicDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
