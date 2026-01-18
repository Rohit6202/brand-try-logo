
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ColorPalette } from '../types';

interface ColorPaletteSuggesterProps {
  logo: string | null;
  onApplyPalette: (palette: ColorPalette) => void;
  activePalette: ColorPalette | null;
}

const ColorPaletteSuggester: React.FC<ColorPaletteSuggesterProps> = ({ logo, onApplyPalette, activePalette }) => {
  const [extractedColor, setExtractedColor] = useState<string>('#4f46e5');
  const [suggestedPalettes, setSuggestedPalettes] = useState<ColorPalette[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple dominant color extraction from logo
  useEffect(() => {
    if (logo) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        setExtractedColor(hex);
      };
      img.src = logo;
    }
  }, [logo]);

  const suggestPalettes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 3 professional color palettes (Complementary, Analogous, and Modern/Minimal) based on the primary color ${extractedColor}. Each palette should have exactly 4 hex colors and a creative name.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                colors: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                description: { type: Type.STRING }
              },
              required: ['name', 'colors', 'description']
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setSuggestedPalettes(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate palettes. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [extractedColor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-lg shadow-inner border border-gray-200"
          style={{ backgroundColor: extractedColor }}
        ></div>
        <div className="flex-grow">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Primary Color</label>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-gray-600">{extractedColor.toUpperCase()}</span>
            <input 
              type="color" 
              value={extractedColor} 
              onChange={(e) => setExtractedColor(e.target.value)}
              className="w-4 h-4 p-0 border-0 cursor-pointer bg-transparent"
            />
          </div>
        </div>
        <button
          onClick={suggestPalettes}
          disabled={isLoading}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Thinking...' : 'AI Suggestions'}
        </button>
      </div>

      {error && <p className="text-[10px] text-red-500">{error}</p>}

      {suggestedPalettes.length > 0 && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
          {suggestedPalettes.map((palette, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${activePalette?.name === palette.name ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
              onClick={() => onApplyPalette(palette)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xs font-bold text-gray-800">{palette.name}</h4>
                {activePalette?.name === palette.name && (
                  <span className="text-[10px] font-bold text-indigo-600">Active</span>
                )}
              </div>
              <div className="flex space-x-1 mb-2">
                {palette.colors.map((c, i) => (
                  <div 
                    key={i} 
                    className="flex-grow h-6 rounded-md shadow-sm first:rounded-l-lg last:rounded-r-lg"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-500 leading-tight italic">{palette.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPaletteSuggester;
