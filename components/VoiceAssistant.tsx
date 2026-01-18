
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData, float32ToInt16 } from '../services/audioUtils';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startAssistant = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16Data = float32ToInt16(inputData);
              const pcmBlob = {
                data: encode(new Uint8Array(int16Data.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            // Handle output transcription if enabled
            if (message.serverContent?.outputTranscription) {
               const text = message.serverContent.outputTranscription.text;
               setMessages(prev => {
                 const last = prev[prev.length - 1];
                 if (last?.role === 'model') {
                   return [...prev.slice(0, -1), { role: 'model', text: last.text + text }];
                 }
                 return [...prev, { role: 'model', text }];
               });
            }

            if (message.serverContent?.inputTranscription) {
               const text = message.serverContent.inputTranscription.text;
               setMessages(prev => {
                 const last = prev[prev.length - 1];
                 if (last?.role === 'user') {
                   return [...prev.slice(0, -1), { role: 'user', text: last.text + text }];
                 }
                 return [...prev, { role: 'user', text }];
               });
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outAudioContextRef.current, 24000, 1);
              const source = outAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outAudioContextRef.current.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => {
            stopAssistant();
            setIsConnecting(false);
          },
          onclose: () => {
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are a professional design consultant for BrandVise AI. Help users brainstorm brand identities, logo ideas, and marketing strategies for their merchandise. Keep it conversational, creative, and enthusiastic.',
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopAssistant = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
        <div>
          <h2 className="text-xl font-bold">Brand Consultant</h2>
          <p className="text-indigo-100 text-sm">Real-time design strategy via Gemini Live</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className={`p-8 rounded-full bg-white shadow-sm border border-indigo-100 transition-all ${isActive ? 'scale-110 shadow-indigo-100' : ''}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-16 h-16 ${isActive ? 'text-indigo-600' : 'text-gray-300'}`}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
               </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Start a Voice Session</h3>
              <p className="text-gray-500 max-w-xs mx-auto text-sm mt-2">Speak naturally with our AI to brainstorm your next big brand move.</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        {!isActive ? (
          <button
            onClick={startAssistant}
            disabled={isConnecting}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 disabled:bg-indigo-400"
          >
            {isConnecting ? 'Connecting...' : 'Connect to Voice AI'}
          </button>
        ) : (
          <div className="flex items-center space-x-4">
             <div className="flex-grow h-12 bg-gray-100 rounded-full overflow-hidden flex items-center px-4">
               <div className="flex space-x-1 items-end h-6">
                 {[1,2,3,4,5,6,7,8,9,0].map(i => (
                   <div key={i} className={`w-1 bg-indigo-500 rounded-full animate-bounce`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                 ))}
               </div>
               <span className="ml-4 text-sm font-medium text-indigo-600">AI is listening...</span>
             </div>
             <button
              onClick={stopAssistant}
              className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
