import type { Language } from '../../contracts/statuses';



export interface IProximityTransport {
  send(frame: string): Promise<void>;
  receive(): Promise<string>;
}


export interface IConnectivity {
  isOnline(): Promise<boolean>;
  onReconnect(listener: () => void): () => void;
}


export interface RecordedSpeech {
  audioBase64: string;
  audioMimeType: string;
}


export interface ISpeechInput {
  record(): Promise<RecordedSpeech>;
  transcribeOffline(language: Language): Promise<string | null>;
}


export interface ISpeechOutput {
  isAvailable(language: Language): Promise<boolean>;
  speak(text: string, language: Language): Promise<void>;
}