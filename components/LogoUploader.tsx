
import React, { useCallback } from 'react';

interface LogoUploaderProps {
  onUpload: (base64: string) => void;
  currentLogo: string | null;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ onUpload, currentLogo }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  return (
    <div className="space-y-4">
      <div 
        className={`relative group h-48 w-full border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden transition-all ${currentLogo ? 'border-indigo-300' : 'border-gray-200 hover:border-indigo-400'}`}
      >
        {currentLogo ? (
          <img src={currentLogo} alt="Uploaded logo" className="max-h-full max-w-full object-contain p-4" />
        ) : (
          <div className="text-center p-6">
            <div className="text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Click or drag your logo (PNG/SVG preferred)</p>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
      </div>
      {currentLogo && (
        <button 
          onClick={() => onUpload('')}
          className="w-full py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
        >
          Remove Logo
        </button>
      )}
    </div>
  );
};

export default LogoUploader;
