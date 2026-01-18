
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ImageEditorProps {
  initialLogo: string | null;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ initialLogo }) => {
  const [currentImage, setCurrentImage] = useState<string | null>(initialLogo);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!currentImage || !editPrompt) return;

    setIsEditing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = currentImage.split(',')[1];
      const mimeType = currentImage.split(',')[0].split(':')[1].split(';')[0];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: editPrompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const editedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setCurrentImage(editedUrl);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setError("AI responded but didn't provide a modified image. Try being more specific like 'Make it look vintage'.");
      } else {
        setEditPrompt('');
      }

    } catch (err) {
      console.error(err);
      setError("Failed to edit image. Ensure the image is valid and the prompt is clear.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCurrentImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Gemini AI Editor</h2>
          <p className="text-sm text-gray-500 mb-6">Describe changes you want to see, like "Make it look 3D" or "Add a neon glow effect".</p>
          
          <div className="space-y-4">
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="e.g., 'Apply a retro 80s synthwave filter to this logo'"
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
            />
            
            <button
              onClick={handleEdit}
              disabled={isEditing || !currentImage || !editPrompt}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {isEditing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>AI is working...</span>
                </>
              ) : (
                <span>Apply Transformation</span>
              )}
            </button>
          </div>

          {error && <p className="mt-4 text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {!currentImage && (
          <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center">
            <p className="text-indigo-600 font-medium mb-4">No image selected</p>
            <label className="px-6 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
              Browse Image
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
        <div className="flex-grow relative aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-8">
          {currentImage ? (
            <img src={currentImage} alt="Editing preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Live Canvas Preview</span>
          {currentImage && (
            <button onClick={() => setCurrentImage(null)} className="text-xs text-red-500 hover:underline">Clear Canvas</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
