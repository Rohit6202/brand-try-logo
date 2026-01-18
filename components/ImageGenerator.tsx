
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ImageSize } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
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
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
          }
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setGeneratedImageUrl(imageUrl);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        setError("Model returned text but no image. Try a more descriptive prompt.");
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key issue. Please select a valid key from a paid GCP project.");
        // @ts-ignore
        if (window.aistudio) await window.aistudio.openSelectKey();
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <span className="text-indigo-600">Gemini 3</span>
          <span>Pro Image Generator</span>
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A high-end luxury perfume bottle in a minimalist marble setting with soft sunlight..."
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-grow min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
              <div className="flex p-1 bg-gray-100 rounded-lg">
                {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${size === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Create Asset</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            * Note: Gemini 3 Pro requires a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline text-indigo-600">paid API key</a> from a GCP project.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium animate-pulse">
          {error}
        </div>
      )}

      {generatedImageUrl && (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 overflow-hidden group">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
            <img src={generatedImageUrl} alt="Generated asset" className="w-full h-full object-cover transition-transform group-hover:scale-[1.02] duration-700" />
            <div className="absolute top-4 right-4 space-x-2">
              <a 
                href={generatedImageUrl} 
                download="brand-asset.png" 
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-indigo-600 hover:text-indigo-700 hover:scale-110 transition-all inline-block"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-4 p-2">
            <h3 className="font-bold text-gray-900">Generated Brand Asset ({size})</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 italic">"{prompt}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
