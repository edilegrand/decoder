
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { PodcastForm } from './components/PodcastForm';
import { PodcastDisplay } from './components/PodcastDisplay';
import { AIAssistant } from './components/AIAssistant';
import { PodcastConfig, PodcastResult } from './types';
import { gemini } from './services/gemini';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PodcastResult | null>(null);
  const [currentConfig, setCurrentConfig] = useState<PodcastConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (config: PodcastConfig) => {
    setIsGenerating(true);
    setCurrentConfig(config);
    setError(null);
    try {
      const podcast = await gemini.generatePodcast(config);
      setResult(podcast);
    } catch (err) {
      console.error(err);
      setError("An error occurred during production. Please check your inputs and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoHome = () => {
    setResult(null);
    setError(null);
  };

  const assistantContext = result || currentConfig || {};

  return (
    <Layout onHome={handleGoHome}>
      {!result ? (
        <div className="space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Create Viral Podcasts <br />
              <span className="gradient-text">In Seconds.</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
              Transform your raw ideas, documents, and articles into professional-grade podcast scripts engineered for maximum retention.
            </p>
          </div>

          <PodcastForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          
          {error && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 border-t border-slate-800 pt-16">
             <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <h4 className="font-bold text-slate-200">High Retention</h4>
                <p className="text-xs text-slate-500">Engineered with viral hook patterns to stop the scroll.</p>
             </div>
             <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <h4 className="font-bold text-slate-200">Human Style</h4>
                <p className="text-xs text-slate-500">Natural interruptions and emotional flow, not robotic lectures.</p>
             </div>
             <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </div>
                <h4 className="font-bold text-slate-200">Viral Distribution</h4>
                <p className="text-xs text-slate-500">Automatically extracts the best clips for TikTok and Reels.</p>
             </div>
          </div>
        </div>
      ) : (
        <PodcastDisplay result={result} onReset={handleGoHome} />
      )}
      
      <AIAssistant context={assistantContext} />
    </Layout>
  );
};

export default App;
