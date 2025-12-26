// src/app/models/voice-agent.model.ts

export type VoiceAgentType = 'vapi' | 'elevenlabs';

export interface VoiceAgent {
  name: string;
  type: VoiceAgentType;
  assistantId: string;
  apiKey?: string;  // Optional for ElevenLabs
  description?: string;
}
