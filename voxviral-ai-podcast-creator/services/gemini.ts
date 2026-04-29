
import { GoogleGenAI, Type, Modality as GenAIModality } from "@google/genai";
import { PodcastConfig, PodcastResult, VoiceID, GroundingLink } from "../types";

export class GeminiService {
  constructor() {}

  async chatWithAssistant(message: string, context: any): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const systemInstruction = `
      You are the VoxViral Executive Producer, a world-class AI podcast consultant.
      Your goal is to help the user create high-retention, viral-ready podcasts.
      
      CONTEXT OF CURRENT PROJECT:
      ${JSON.stringify(context)}
      
      BEHAVIOR:
      - Be punchy, professional, and creative.
      - If the user asks to rewrite something, provide 2-3 creative options.
      - Suggest viral "hooks" and emotional beats.
      - Keep responses concise and formatted with markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.8,
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  }

  async generatePodcast(config: PodcastConfig): Promise<PodcastResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const h1 = config.hostNames.host1;
    const h2 = config.hostNames.host2;

    const hasUrls = config.sourceUrls.length > 0;

    const prompt = `
      Task: Create a world-class podcast script.
      
      PRIMARY SOURCES (STRICTLY FOLLOW THESE):
      ${config.sourceText ? `Source Text: ${config.sourceText}` : ''}
      ${hasUrls ? `CRITICAL: You MUST research and use the content from these specific URLs for the podcast topic and title: ${config.sourceUrls.join(', ')}. Do NOT deviate from the specific subject matter of these links.` : ''}
      
      CONFIG:
      - Number of Hosts: ${config.hostCount}
      - Targeted Duration: ${config.durationMinutes} minutes
      - Style: ${config.modality}
      - Tone: ${config.tone}
      
      MANDATORY STRUCTURE:
      1. Hook (10-20s): Stop the scroll based on the primary source's most shocking or interesting point.
      2. Context Setup: Why this source material matters.
      3. Core Discussion: Natural flow, human-like, stories, analogies derived from the source material.
      4. Viral Moments: 2-4 quotable segments.
      5. Closing: Strong takeaway + open question.
      
      GIVE HOST NAMES:
      Use exactly "${h1}" for the first host.
      ${h2 ? `Use exactly "${h2}" for the second host.` : ''}

      Format your output as a valid JSON object matching the requested schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: hasUrls ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            youtubeDescription: { type: Type.STRING },
            script: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  timestamp: { type: Type.STRING }
                },
                required: ["speaker", "text"]
              }
            },
            viralClips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "script", "viralClips", "youtubeDescription"]
        }
      }
    });

    try {
      const result = JSON.parse(response.text || "{}");
      
      // Extract grounding links if search was used
      const groundingLinks: GroundingLink[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri) {
            groundingLinks.push({
              uri: chunk.web.uri,
              title: chunk.web.title || chunk.web.uri
            });
          }
        });
      }

      const voiceMapping: Record<string, VoiceID> = {};
      const voicePitchMapping: Record<string, number> = {};
      
      voiceMapping[h1] = config.voices.host1;
      voicePitchMapping[h1] = config.voicePitch.host1;
      
      if (config.hostCount === '2' && h2) {
        voiceMapping[h2] = config.voices.host2 || 'Puck';
        voicePitchMapping[h2] = config.voicePitch.host2;
      }

      return { ...result, voiceMapping, voicePitchMapping, groundingLinks } as PodcastResult;
    } catch (e) {
      console.error("Failed to parse script JSON", e);
      throw new Error("Generated script was not in valid format.");
    }
  }

  async generateAudio(text: string, voiceMapping: Record<string, VoiceID>, voicePitchMapping?: Record<string, number>): Promise<Uint8Array | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const speakers = Object.keys(voiceMapping);
    const isMultiSpeaker = speakers.length >= 2;
    
    // Build descriptive character instructions based on user choice
    const getPitchInstruction = (speakerName: string) => {
      const p = voicePitchMapping?.[speakerName] || 0;
      if (p < -0.4) return "Use a deep, resonant, and bassy vocal quality.";
      if (p > 0.4) return "Use a sharp, bright, and high-pitched vocal quality.";
      return "";
    };

    let contents = isMultiSpeaker 
      ? `TTS the following conversation. ${speakers.map(s => `${s}: ${getPitchInstruction(s)}`).join(" ")}\n\n${text}` 
      : `${getPitchInstruction(speakers[0])} Say this as a solo podcast host: ${text}`;

    const config: any = {
      responseModalities: [GenAIModality.AUDIO],
      speechConfig: isMultiSpeaker ? {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: speakers.slice(0, 2).map(speakerName => ({
            speaker: speakerName,
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: voiceMapping[speakerName] || 'Kore' 
              } 
            }
          }))
        }
      } : {
        voiceConfig: { 
          prebuiltVoiceConfig: { 
            voiceName: voiceMapping[speakers[0]] || 'Kore' 
          } 
        }
      }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: contents }] }],
            config: config
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;

        return this.decodeBase64(base64Audio);
    } catch (err) {
        console.error("TTS generation error", err);
        return null;
    }
  }

  async generateVoicePreview(voiceId: VoiceID, label: string, persona: string): Promise<Uint8Array | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const text = `Hi there! I'm ${label}, your ${persona} voice. I'm excited to help you host your next viral podcast episode. How do I sound?`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [GenAIModality.AUDIO],
                speechConfig: {
                    voiceConfig: { 
                        prebuiltVoiceConfig: { voiceName: voiceId } 
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;

        return this.decodeBase64(base64Audio);
    } catch (err) {
        console.error("Voice preview generation error", err);
        return null;
    }
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const numChannels = 1;
    const sampleRate = 24000;
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  encodeWAV(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true);
    new Uint8Array(buffer, 44).set(pcmData);
    return new Blob([view], { type: 'audio/wav' });
  }
}

export const gemini = new GeminiService();
