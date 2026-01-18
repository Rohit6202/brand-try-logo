
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface LogoGeneratorProps {
  onLogoReady: (base64: string) => void;
}

const LogoGenerator: React.FC<LogoGeneratorProps> = ({ onLogoReady }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAndSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);

    try {
      await checkAndSelectKey();
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // We explicitly prompt for a clean, vector-style logo on a white background for easy blending
      const enhancedPrompt = `A clean, minimalist, professional vector-style logo for ${prompt}. The design should be centered on a pure white background, flat design, high contrast. No shadows, no 3D effects.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          onLogoReady(imageUrl);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        setError("AI returned concepts but no image. Try describing the shapes you want.");
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to generate logo. Check if you have a paid API key selected.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-right-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A mountain peak for a luxury climbing brand..."
          className="w-full h-24 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
        />
        <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-[10px] text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span>Auto-vector mode</span>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt}
        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-sm">Designing Logo...</span>
          </>
        ) : (
          <span className="text-sm">Generate AI Logo</span>
        )}
      </button>
      
      {error && <p className="text-[10px] text-red-500 font-medium text-center">{error}</p>}
      <p className="text-[9px] text-center text-gray-400 italic">Gemini 3 Pro optimized for high-fidelity brand assets</p>
    </div>
  );
};

export default LogoGenerator;
