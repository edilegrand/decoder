
import React, { useState, useRef } from 'react';
import { PodcastConfig, HostCount, Modality, Tone, VoiceID, VOICE_PROFILES } from '../types';
import { gemini } from '../services/gemini';

interface Props {
  onGenerate: (config: PodcastConfig) => void;
  isGenerating: boolean;
}

const MODALITIES: Modality[] = [
  'Debate / Opposing Views',
  'Friendly Conversation',
  'Devil’s Advocate',
  'Expert vs Curious Beginner',
  'Host vs Skeptic',
  'Fast-paced, high-energy',
  'Serious, analytical',
  'Light humor + banter'
];

const TONES: Tone[] = [
  'Calm / Neutral',
  'High-energy / Viral',
  'Thought-provoking',
  'Emotional / Story-driven',
  'Bold / Controversial'
];

export const PodcastForm: React.FC<Props> = ({ onGenerate, isGenerating }) => {
  const [sourceText, setSourceText] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [hostCount, setHostCount] = useState<HostCount>('2');
  const [duration, setDuration] = useState(15);
  const [modality, setModality] = useState<Modality>(MODALITIES[1]);
  const [tone, setTone] = useState<Tone>(TONES[1]);
  
  // Voice & Name state
  const [voice1, setVoice1] = useState<VoiceID>('Kore');
  const [name1, setName1] = useState('Alex');
  const [pitch1, setPitch1] = useState(0);

  const [voice2, setVoice2] = useState<VoiceID>('Puck');
  const [name2, setName2] = useState('Jordan');
  const [pitch2, setPitch2] = useState(0);

  // Preview state
  const [previewingVoiceId, setPreviewingVoiceId] = useState<VoiceID | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      sourceText,
      sourceFiles: [],
      sourceUrls: urls.filter(u => u.trim() !== ''),
      hostCount,
      durationMinutes: duration,
      modality,
      tone,
      hostNames: {
        host1: name1.trim() || 'Host A',
        host2: hostCount === '2' ? (name2.trim() || 'Host B') : undefined
      },
      voices: {
        host1: voice1,
        host2: hostCount === '2' ? voice2 : undefined
      },
      voicePitch: {
        host1: pitch1,
        host2: pitch2
      }
    });
  };

  const handleAuditionVoice = async (e: React.MouseEvent, voiceId: VoiceID, label: string, persona: string) => {
    e.stopPropagation(); // Don't select the voice just by clicking the preview button
    
    if (previewingVoiceId) {
      currentSourceRef.current?.stop();
      if (previewingVoiceId === voiceId) {
        setPreviewingVoiceId(null);
        return;
      }
    }

    try {
      setPreviewingVoiceId(voiceId);
      const audioData = await gemini.generateVoicePreview(voiceId, label, persona);
      
      if (!audioData) throw new Error("Preview failed");
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const buffer = await gemini.decodeAudioData(audioData, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPreviewingVoiceId(null);
      source.start();
      currentSourceRef.current = source;
    } catch (err) {
      console.error(err);
      setPreviewingVoiceId(null);
    }
  };

  const addUrlField = () => setUrls([...urls, '']);
  const updateUrl = (idx: number, val: string) => {
    const next = [...urls];
    next[idx] = val;
    setUrls(next);
  };

  const formatDurationLabel = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const renderVoiceGrid = (selectedId: VoiceID, onSelect: (id: VoiceID) => void) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
      {VOICE_PROFILES.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onSelect(v.id)}
          className={`text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 relative overflow-hidden group/voice ${selectedId === v.id ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
        >
          {/* Active Audition Glow */}
          {previewingVoiceId === v.id && (
            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none"></div>
          )}

          <div className="relative z-10 text-xl shrink-0 group-hover/voice:scale-110 transition-transform">{v.emoji}</div>
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center justify-between gap-1 mb-0.5">
               <div className="text-xs font-bold text-slate-200 truncate">{v.label}</div>
               <span className={`text-[8px] px-1 py-0.5 rounded-md font-bold uppercase tracking-tighter shrink-0 ${v.gender === 'Female' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'}`}>
                 {v.gender}
               </span>
            </div>
            <div className="text-[9px] text-slate-500 font-medium truncate">{v.persona}</div>
          </div>

          {/* Audition Button */}
          <div 
            onClick={(e) => handleAuditionVoice(e, v.id, v.label, v.persona)}
            className={`relative z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${previewingVoiceId === v.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            title="Try this voice"
          >
            {previewingVoiceId === v.id ? (
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-0.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite]"></div>
                <div className="w-0.5 bg-white animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]"></div>
                <div className="w-0.5 bg-white animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]"></div>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  const renderToneSlider = (val: number, setVal: (v: number) => void) => (
    <div className="space-y-2 px-1 pt-2">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter text-slate-500">
        <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg> Deep / Resonant</span>
        <span className="text-indigo-400">{val === 0 ? 'Neutral' : val < 0 ? 'Deepened' : 'Sharpened'}</span>
        <span className="flex items-center gap-1">Sharp / Bright <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 9 5-5 5 5"/><path d="m7 15 5 5 5-5"/></svg></span>
      </div>
      <input 
        type="range" min="-1" max="1" step="0.1" 
        value={val} 
        onChange={(e) => setVal(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="M2 17h10"/><path d="M2 19h10"/></svg>
              Input Sources
            </h3>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste articles, notes, or key talking points here..."
              className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference Links</label>
              {urls.map((url, i) => (
                <input
                  key={i}
                  type="url"
                  value={url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              ))}
              <button 
                type="button" 
                onClick={addUrlField}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                + Add another link
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              AI Voice Settings
            </h3>
            
            <div className="space-y-8">
              {/* Host 1 */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{hostCount === '2' ? 'Host A Identity' : 'Host Identity'}</label>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">Try voices below</span>
                  </div>
                  <input 
                    type="text"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    placeholder="e.g. Alex"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-indigo-400 font-bold focus:outline-none focus:border-indigo-500 max-w-[150px]"
                  />
                </div>
                {renderVoiceGrid(voice1, setVoice1)}
                {renderToneSlider(pitch1, setPitch1)}
              </div>

              {/* Host 2 */}
              {hostCount === '2' && (
                <div className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-right-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Host B Identity</label>
                    <input 
                      type="text"
                      value={name2}
                      onChange={(e) => setName2(e.target.value)}
                      placeholder="e.g. Jordan"
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-indigo-400 font-bold focus:outline-none focus:border-indigo-500 max-w-[150px]"
                    />
                  </div>
                  {renderVoiceGrid(voice2, setVoice2)}
                  {renderToneSlider(pitch2, setPitch2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Episode Config */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.15.09a2 2 0 0 0 .73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Format Settings
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Format & Hosts</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHostCount('1')}
                    className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${hostCount === '1' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <span className="text-xl">🎙️</span>
                    <span className="text-xs font-bold">Solo Host</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHostCount('2')}
                    className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${hostCount === '2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    <span className="text-xl">👥</span>
                    <span className="text-xs font-bold">Co-Hosts</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">Target Duration</label>
                  <span className="text-xs font-bold text-indigo-400">{formatDurationLabel(duration)}</span>
                </div>
                <input
                  type="range" min="1" max="120" step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Modality</label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as Modality)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Energy & Emotion</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isGenerating || (!sourceText && urls.every(u => !u))}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 overflow-hidden group"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Producing Podcast...
              </>
            ) : (
              <>
                Generate Master Script
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
