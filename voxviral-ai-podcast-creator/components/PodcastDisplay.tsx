
import React, { useState, useRef, useEffect } from 'react';
import { PodcastResult, AudioState, ScriptLine } from '../types';
import { gemini } from '../services/gemini';

interface Props {
  result: PodcastResult;
  onReset: () => void;
}

export const PodcastDisplay: React.FC<Props> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'distribution'>('script');
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState<ScriptLine[]>(result.script);
  
  // Audio states
  const [previewState, setPreviewState] = useState<AudioState>({ isPlaying: false, isLoading: false });
  const [fullAudioState, setFullAudioState] = useState<AudioState>({ isPlaying: false, isLoading: false });
  const [fullAudioUrl, setFullAudioUrl] = useState<string | null>(null);
  
  // Custom Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const previewSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fullAudioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setEditedScript(result.script);
    setFullAudioUrl(null);
    return () => {
      if (fullAudioUrl) URL.revokeObjectURL(fullAudioUrl);
    };
  }, [result.script]);

  // Sync state with audio element
  useEffect(() => {
    const audio = fullAudioElementRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [fullAudioUrl]);

  const handlePlayPreview = async () => {
    if (previewState.isPlaying) {
      previewSourceRef.current?.stop();
      setPreviewState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    try {
      setPreviewState({ isPlaying: false, isLoading: true });
      const previewLines = editedScript.slice(0, 5);
      const textToSpeak = previewLines.map(l => `${l.speaker}: ${l.text}`).join('\n');
      const audioData = await gemini.generateAudio(textToSpeak, result.voiceMapping, result.voicePitchMapping);
      
      if (!audioData) throw new Error("Audio generation failed");
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const buffer = await gemini.decodeAudioData(audioData, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPreviewState({ isPlaying: false, isLoading: false });
      source.start();
      previewSourceRef.current = source;
      setPreviewState({ isPlaying: true, isLoading: false });
    } catch (err) {
      console.error(err);
      setPreviewState({ isPlaying: false, isLoading: false, error: "Failed to generate preview audio" });
    }
  };

  const handleGenerateFullAudio = async () => {
    try {
      setFullAudioState({ isPlaying: false, isLoading: true });
      const fullText = editedScript.map(l => `${l.speaker}: ${l.text}`).join('\n');
      const audioData = await gemini.generateAudio(fullText, result.voiceMapping, result.voicePitchMapping);
      if (!audioData) throw new Error("Full audio generation failed");

      const wavBlob = gemini.encodeWAV(audioData, 24000);
      const url = URL.createObjectURL(wavBlob);
      setFullAudioUrl(url);
      setFullAudioState({ isPlaying: false, isLoading: false });
    } catch (err) {
      console.error(err);
      setFullAudioState({ isPlaying: false, isLoading: false, error: "Failed to produce full audio" });
    }
  };

  const toggleFullPlay = () => {
    if (!fullAudioElementRef.current) return;
    if (isPlaying) {
      fullAudioElementRef.current.pause();
    } else {
      fullAudioElementRef.current.play();
    }
  };

  const stopFullAudio = () => {
    if (!fullAudioElementRef.current) return;
    fullAudioElementRef.current.pause();
    fullAudioElementRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateLine = (index: number, field: keyof ScriptLine, value: string) => {
    const next = [...editedScript];
    next[index] = { ...next[index], [field]: value };
    setEditedScript(next);
    if (fullAudioUrl) {
      URL.revokeObjectURL(fullAudioUrl);
      setFullAudioUrl(null);
    }
  };

  const removeLine = (index: number) => {
    const next = editedScript.filter((_, i) => i !== index);
    setEditedScript(next);
    setFullAudioUrl(null);
  };

  const addLine = () => {
    setEditedScript([...editedScript, { speaker: Object.keys(result.voiceMapping)[0], text: '', timestamp: '' }]);
    setFullAudioUrl(null);
  };

  const handleDownloadScript = () => {
    const finalResult = { ...result, script: editedScript };
    const blob = new Blob([JSON.stringify(finalResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '_')}_script.json`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Hero / Header */}
      <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 rotate-12"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4 uppercase tracking-widest">
            Production Ready
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{result.title}</h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">{result.description}</p>
          
          <div className="space-y-6">
            {fullAudioUrl ? (
              <div className="space-y-4 animate-in slide-in-from-top-4">
                <audio ref={fullAudioElementRef} src={fullAudioUrl} className="hidden" />
                
                {/* Custom Audio Suite */}
                <div className="glass bg-slate-900/40 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={toggleFullPlay}
                      className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      )}
                    </button>
                    <button 
                      onClick={stopFullAudio}
                      className="w-12 h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center border border-white/5 transition-all"
                      title="Stop & Reset"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                    </button>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500 uppercase tracking-tighter">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-100 ease-linear"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                      <input 
                        type="range" 
                        min="0" max={duration || 0} step="0.1" 
                        value={currentTime}
                        onChange={(e) => {
                          if (fullAudioElementRef.current) {
                            fullAudioElementRef.current.currentTime = parseFloat(e.target.value);
                          }
                        }}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <a 
                    href={fullAudioUrl} 
                    download={`${result.title.replace(/\s+/g, '_')}_master.wav`}
                    className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 active:scale-95 shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Export Master
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={handleGenerateFullAudio}
                  disabled={fullAudioState.isLoading}
                  className="px-8 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 overflow-hidden relative"
                >
                  {fullAudioState.isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Mastering Audio...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M6 8v8"/><path d="M2 10v4"/><path d="M18 8v8"/><path d="M22 10v4"/></svg>
                      Produce Full Audio
                    </>
                  )}
                </button>

                <button 
                  onClick={handlePlayPreview}
                  disabled={previewState.isLoading}
                  className={`px-6 py-5 ${previewState.isPlaying ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-white'} hover:bg-slate-700 disabled:bg-slate-900/50 rounded-2xl font-bold flex items-center gap-2 transition-all border border-white/5`}
                >
                  {previewState.isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></div>
                  ) : previewState.isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
                  {previewState.isPlaying ? 'Stop' : 'Quick Preview'}
                </button>
              </div>
            )}
            {(previewState.error || fullAudioState.error) && (
              <p className="text-rose-400 text-xs mt-4 font-medium px-2">{previewState.error || fullAudioState.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit mx-auto shadow-xl">
        <button
          onClick={() => setActiveTab('script')}
          className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'script' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          Master Script
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'distribution' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          Viral Distribution
        </button>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto pb-6">
        {activeTab === 'script' ? (
          <div className="glass rounded-3xl p-6 md:p-10 space-y-8 border-t-4 border-t-indigo-500 shadow-2xl shadow-indigo-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
                Dialogue Log
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isEditing ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                >
                  {isEditing ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      Lock Script
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Edit Dialogue
                    </>
                  )}
                </button>
                <button 
                  className="bg-slate-800 text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold"
                  title="Download Script JSON"
                  onClick={handleDownloadScript}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Export JSON
                </button>
              </div>
            </div>
            
            <div className="space-y-8">
              {editedScript.map((line, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-8 group relative animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="md:w-32 flex-shrink-0">
                    {isEditing ? (
                      <select
                        value={line.speaker}
                        onChange={(e) => updateLine(i, 'speaker', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 focus:border-indigo-500 outline-none"
                      >
                        {Object.keys(result.voiceMapping).map(speakerName => (
                          <option key={speakerName} value={speakerName}>{speakerName}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400/80 mb-1 block">
                        {line.speaker}
                      </span>
                    )}
                    {!isEditing && line.timestamp && (
                      <span className="text-[10px] font-mono text-slate-600 block">{line.timestamp}</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    {isEditing ? (
                      <textarea
                        value={line.text}
                        onChange={(e) => updateLine(i, 'text', e.target.value)}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm leading-relaxed focus:border-indigo-500 outline-none resize-none"
                      />
                    ) : (
                      <p className="text-slate-200 leading-relaxed text-lg font-medium selection:bg-indigo-500/30">
                        {line.text}
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => removeLine(i)}
                      className="absolute -right-2 top-0 p-1.5 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10 rounded-lg"
                      title="Remove line"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              ))}

              {isEditing && (
                <button
                  onClick={addLine}
                  className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-400 hover:border-indigo-400/50 transition-all font-bold text-sm flex items-center justify-center gap-2 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  Add New Script Line
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             {/* Grounding Links */}
             {result.groundingLinks && result.groundingLinks.length > 0 && (
               <div className="glass rounded-3xl p-8 border-l-4 border-l-indigo-500 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Source References
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.groundingLinks.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-indigo-500/50 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </div>
                        <span className="text-sm font-medium text-slate-300 truncate">{link.title}</span>
                      </a>
                    ))}
                  </div>
               </div>
             )}

             {/* Viral Clips */}
             <div className="glass rounded-3xl p-8 border-l-4 border-l-emerald-500">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                 Viral Clip Opportunities (Shorts/Reels)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {result.viralClips.map((clip, i) => (
                   <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-start gap-4 hover:border-emerald-500/30 transition-all cursor-default group">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <p className="text-slate-300 font-medium">{clip}</p>
                   </div>
                 ))}
               </div>
             </div>

             {/* SEO Description */}
             <div className="glass rounded-3xl p-8 border-l-4 border-l-amber-500">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  YouTube/Spotify Optimized Description
                </h3>
                <div className="bg-slate-900/50 rounded-xl p-6 text-slate-400 whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-60 overflow-y-auto border border-slate-800">
                  {result.youtubeDescription}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(result.youtubeDescription)}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy to Clipboard
                </button>
             </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pb-12">
        <button 
          onClick={onReset}
          className="group flex items-center gap-2 px-8 py-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full font-bold transition-all border border-slate-700/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Return to Workspace
        </button>
      </div>
    </div>
  );
};
