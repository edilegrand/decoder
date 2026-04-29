
export type HostCount = '1' | '2';

// Voice names are capitalized to match Gemini API prebuilt voice config expectations
export type VoiceID = 'Kore' | 'Puck' | 'Charon' | 'Zephyr' | 'Fenrir' | 'Aoede' | 'Autonoe' | 'Iapetus' | 'Leda' | 'Orus';

export interface VoiceProfile {
  id: VoiceID;
  label: string;
  description: string;
  persona: string;
  emoji: string;
  gender: 'Male' | 'Female';
}

export const VOICE_PROFILES: VoiceProfile[] = [
  // Females
  { id: 'Kore', label: 'Professional', persona: 'The Newsroom', description: 'Crisp, neutral, and polished.', emoji: '🎙️', gender: 'Female' },
  { id: 'Zephyr', label: 'Warm', persona: 'The Coffee Shop', description: 'Approachable and friendly.', emoji: '☕', gender: 'Female' },
  { id: 'Aoede', label: 'Academic', persona: 'The Professor', description: 'Measured and intellectual.', emoji: '📖', gender: 'Female' },
  { id: 'Autonoe', label: 'Bright', persona: 'The Influencer', description: 'Upbeat and youthful.', emoji: '✨', gender: 'Female' },
  { id: 'Leda', label: 'Authoritative', persona: 'The Executive', description: 'Steady and commanding.', emoji: '🏢', gender: 'Female' },
  // Males
  { id: 'Puck', label: 'Energetic', persona: 'The Hype Man', description: 'High-energy and fast-paced.', emoji: '⚡', gender: 'Male' },
  { id: 'Charon', label: 'Deep', persona: 'The Late Night', description: 'Resonant and steady.', emoji: '🌑', gender: 'Male' },
  { id: 'Fenrir', label: 'Bold', persona: 'The Outdoorsman', description: 'Rugged and earthy.', emoji: '🐺', gender: 'Male' },
  { id: 'Iapetus', label: 'Expressive', persona: 'The Narrator', description: 'Dramatic and storytelling.', emoji: '🎭', gender: 'Male' },
  { id: 'Orus', label: 'Melodic', persona: 'The Philosopher', description: 'Thoughtful and soothing.', emoji: '🎻', gender: 'Male' },
];

export type Modality = 
  | 'Debate / Opposing Views'
  | 'Friendly Conversation'
  | 'Devil’s Advocate'
  | 'Expert vs Curious Beginner'
  | 'Host vs Skeptic'
  | 'Fast-paced, high-energy'
  | 'Serious, analytical'
  | 'Light humor + banter';

export type Tone = 
  | 'Calm / Neutral'
  | 'High-energy / Viral'
  | 'Thought-provoking'
  | 'Emotional / Story-driven'
  | 'Bold / Controversial';

export interface PodcastConfig {
  sourceText: string;
  sourceFiles: File[];
  sourceUrls: string[];
  hostCount: HostCount;
  durationMinutes: number;
  modality: Modality;
  tone: Tone;
  hostNames: {
    host1: string;
    host2?: string;
  };
  voices: {
    host1: VoiceID;
    host2?: VoiceID;
  };
  voicePitch: {
    host1: number; // -1 to 1
    host2: number; // -1 to 1
  };
}

export interface ScriptLine {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface PodcastResult {
  title: string;
  description: string;
  youtubeDescription: string;
  script: ScriptLine[];
  viralClips: string[];
  voiceMapping: Record<string, VoiceID>;
  voicePitchMapping: Record<string, number>;
  groundingLinks?: GroundingLink[];
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error?: string;
}
