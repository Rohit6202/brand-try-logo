
import React from 'react';
import { LogoTransform } from '../types';

interface PlacementControlsProps {
  transform: LogoTransform;
  onChange: (transform: LogoTransform) => void;
}

const PlacementControls: React.FC<PlacementControlsProps> = ({ transform, onChange }) => {
  const update = (key: keyof LogoTransform, value: any) => {
    onChange({ ...transform, [key]: value });
  };

  const Slider = ({ label, min, max, value, step, onChange: onValChange }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{label}</label>
        <span className="text-[10px] font-mono text-indigo-600 font-bold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <Slider label="Shift X" min={-50} max={50} step={1} value={transform.offsetX} onChange={(v: number) => update('offsetX', v)} />
        <Slider label="Shift Y" min={-50} max={50} step={1} value={transform.offsetY} onChange={(v: number) => update('offsetY', v)} />
        <Slider label="Size" min={0.2} max={3} step={0.1} value={transform.scale} onChange={(v: number) => update('scale', v)} />
        <Slider label="Rotate" min={-180} max={180} step={5} value={transform.rotate} onChange={(v: number) => update('rotate', v)} />
        <Slider label="Opacity" min={0} max={1} step={0.05} value={transform.opacity} onChange={(v: number) => update('opacity', v)} />
        
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Blend</label>
          <select 
            value={transform.blendMode}
            onChange={(e) => update('blendMode', e.target.value)}
            className="w-full p-1.5 text-[10px] font-bold bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="multiply">Multiply (Darken)</option>
            <option value="normal">Normal</option>
            <option value="screen">Screen (Lighten)</option>
            <option value="overlay">Overlay</option>
          </select>
        </div>
      </div>

      <button 
        onClick={() => onChange({ 
          offsetX: 0, offsetY: 0, scale: 1, rotate: 0, opacity: 0.9, blendMode: 'multiply' 
        })}
        className="w-full py-1 text-[10px] text-gray-400 hover:text-gray-600 font-medium transition-colors"
      >
        Reset Placement
      </button>
    </div>
  );
};

export default PlacementControls;
