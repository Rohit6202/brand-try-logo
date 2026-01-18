
import React, { useState, useCallback, useEffect } from 'react';
import { AppTab, MockupProduct, ColorPalette, LogoTransform } from './types';
import { Icons, MOCKUP_PRODUCTS } from './constants';
import LogoUploader from './components/LogoUploader';
import ProductPreview from './components/ProductPreview';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import VoiceAssistant from './components/VoiceAssistant';
import ColorPaletteSuggester from './components/ColorPaletteSuggester';
import LogoGenerator from './components/LogoGenerator';
import PlacementControls from './components/PlacementControls';

const DEFAULT_TRANSFORM: LogoTransform = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotate: 0,
  opacity: 0.9,
  blendMode: 'multiply'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.MOCKUPS);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MockupProduct>(MOCKUP_PRODUCTS[0]);
  const [activePalette, setActivePalette] = useState<ColorPalette | null>(null);
  const [logoTransform, setLogoTransform] = useState<LogoTransform>(DEFAULT_TRANSFORM);
  const [showLogoGen, setShowLogoGen] = useState(false);

  const handleLogoUpload = useCallback((base64: string) => {
    setUploadedLogo(base64);
    setLogoTransform(DEFAULT_TRANSFORM); // Reset transform on new logo
  }, []);

  const handleApplyPalette = useCallback((palette: ColorPalette) => {
    setActivePalette(palette);
  }, []);

  // Sync theme colors with CSS variables
  useEffect(() => {
    if (activePalette && activePalette.colors.length > 0) {
      document.documentElement.style.setProperty('--brand-primary', activePalette.colors[0]);
      document.documentElement.style.setProperty('--brand-secondary', activePalette.colors[1] || activePalette.colors[0]);
    } else {
      document.documentElement.style.setProperty('--brand-primary', '#4f46e5');
      document.documentElement.style.setProperty('--brand-secondary', '#818cf8');
    }
  }, [activePalette]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-colors duration-500">
      <style>{`
        :root {
          --brand-primary: #4f46e5;
          --brand-secondary: #818cf8;
        }
        .bg-brand-primary { background-color: var(--brand-primary); }
        .text-brand-primary { color: var(--brand-primary); }
        .border-brand-primary { border-color: var(--brand-primary); }
        .bg-brand-secondary { background-color: var(--brand-secondary); }
      `}</style>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold transition-colors duration-500">B</div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">BrandVise AI</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: AppTab.MOCKUPS, label: 'Mockups' },
              { id: AppTab.EDITOR, label: 'Smart Editor' },
              { id: AppTab.GENERATOR, label: 'Asset Gen' },
              { id: AppTab.VOICE, label: 'AI Assistant' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AppTab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-brand-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">
              Gemini Powered
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === AppTab.MOCKUPS && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* Logo Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Icons.Upload />
                    <span>Brand Logo</span>
                  </h2>
                  <button 
                    onClick={() => setShowLogoGen(!showLogoGen)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 px-2 py-1 bg-indigo-50 rounded-md"
                  >
                    {showLogoGen ? 'Back to Upload' : 'AI Generate'}
                  </button>
                </div>

                {showLogoGen ? (
                  <LogoGenerator onLogoReady={handleLogoUpload} />
                ) : (
                  <LogoUploader onUpload={handleLogoUpload} currentLogo={uploadedLogo} />
                )}
              </div>

              {/* Placement Controls - Only show if logo exists */}
              {uploadedLogo && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-left-4">
                  <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Icons.Magic />
                    <span>Placement & FX</span>
                  </h2>
                  <PlacementControls 
                    transform={logoTransform} 
                    onChange={setLogoTransform} 
                  />
                </div>
              )}

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  <span>Color Strategy</span>
                  {activePalette && (
                    <button 
                      onClick={() => setActivePalette(null)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </h2>
                <ColorPaletteSuggester 
                  logo={uploadedLogo} 
                  onApplyPalette={handleApplyPalette} 
                  activePalette={activePalette}
                />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Mockup Selection</h2>
                <div className="grid grid-cols-2 gap-3">
                  {MOCKUP_PRODUCTS.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`p-3 text-left rounded-xl border-2 transition-all ${selectedProduct.id === product.id ? 'border-brand-primary bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-200 bg-white'}`}
                    >
                      <img src={product.image} alt={product.name} className="w-full h-20 object-cover rounded-md mb-2" />
                      <span className="text-sm font-medium block truncate">{product.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-8">
              <ProductPreview 
                logo={uploadedLogo} 
                product={selectedProduct} 
                activePalette={activePalette}
                transform={logoTransform}
              />
            </div>
          </div>
        )}

        {activeTab === AppTab.EDITOR && (
          <ImageEditor initialLogo={uploadedLogo} />
        )}

        {activeTab === AppTab.GENERATOR && (
          <ImageGenerator />
        )}

        {activeTab === AppTab.VOICE && (
          <VoiceAssistant />
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
        <button onClick={() => setActiveTab(AppTab.MOCKUPS)} className={`flex flex-col items-center space-y-1 ${activeTab === AppTab.MOCKUPS ? 'text-brand-primary' : 'text-gray-400'}`}>
          <div className="scale-75"><Icons.Upload /></div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Mockups</span>
        </button>
        <button onClick={() => setActiveTab(AppTab.EDITOR)} className={`flex flex-col items-center space-y-1 ${activeTab === AppTab.EDITOR ? 'text-brand-primary' : 'text-gray-400'}`}>
          <div className="scale-75"><Icons.Magic /></div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Editor</span>
        </button>
        <button onClick={() => setActiveTab(AppTab.GENERATOR)} className={`flex flex-col items-center space-y-1 ${activeTab === AppTab.GENERATOR ? 'text-brand-primary' : 'text-gray-400'}`}>
          <div className="scale-75"><Icons.Photo /></div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Gen</span>
        </button>
        <button onClick={() => setActiveTab(AppTab.VOICE)} className={`flex flex-col items-center space-y-1 ${activeTab === AppTab.VOICE ? 'text-brand-primary' : 'text-gray-400'}`}>
          <div className="scale-75"><Icons.Microphone /></div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Talk</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
