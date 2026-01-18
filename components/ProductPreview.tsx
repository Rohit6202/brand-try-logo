
import React from 'react';
import { MockupProduct, ColorPalette, LogoTransform } from '../types';

interface ProductPreviewProps {
  logo: string | null;
  product: MockupProduct;
  activePalette?: ColorPalette | null;
  transform?: LogoTransform;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ logo, product, activePalette, transform }) => {
  // Construct style based on base position + user overrides
  const logoStyle: React.CSSProperties = {
    top: `calc(${product.logoPosition.top} + ${transform?.offsetY || 0}%)`,
    left: `calc(${product.logoPosition.left} + ${transform?.offsetX || 0}%)`,
    width: `calc(${product.logoPosition.width} * ${transform?.scale || 1})`,
    transform: `${product.logoPosition.transform || ''} rotate(${transform?.rotate || 0}deg)`.trim(),
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
    opacity: transform?.opacity ?? 0.9,
    mixBlendMode: transform?.blendMode ?? 'multiply',
    transition: 'all 0.1s ease-out',
    zIndex: 20
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col items-center justify-center">
      <div 
        className="relative w-full max-w-2xl aspect-square rounded-xl overflow-hidden shadow-inner flex items-center justify-center transition-colors duration-1000"
        style={{ 
          backgroundColor: activePalette ? `${activePalette.colors[3]}20` : '#f9fafb' 
        }}
      >
        {activePalette && (
          <div 
            className="absolute inset-0 opacity-10 blur-3xl"
            style={{
              background: `radial-gradient(circle at center, ${activePalette.colors[1]}, transparent)`
            }}
          ></div>
        )}

        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover relative z-10"
        />
        
        {logo ? (
          <div 
            className="absolute flex items-center justify-center"
            style={logoStyle}
          >
            <img 
              src={logo} 
              alt="Logo on product" 
              className="w-full h-auto object-contain" 
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] z-20">
            <div className="bg-white/90 px-6 py-4 rounded-2xl shadow-lg text-center">
              <p className="text-gray-800 font-bold mb-1">Set Your Logo</p>
              <p className="text-xs text-gray-500">to preview on the {product.name}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="text-xl font-bold text-gray-900">{product.name} Studio</h3>
        <p className="text-gray-500 text-sm">Real-time placement with advanced layering</p>
        
        {activePalette && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Active Brand Theme</span>
            <div className="flex space-x-1">
              {activePalette.colors.map(c => (
                <div key={c} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPreview;
