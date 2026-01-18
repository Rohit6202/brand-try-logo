
export enum AppTab {
  MOCKUPS = 'mockups',
  GENERATOR = 'generator',
  EDITOR = 'editor',
  VOICE = 'voice'
}

export interface LogoTransform {
  offsetX: number; // percentage offset from default
  offsetY: number; // percentage offset from default
  scale: number;   // multiplier
  rotate: number;  // degrees
  opacity: number; // 0-1
  blendMode: 'multiply' | 'normal' | 'screen' | 'overlay';
}

export interface MockupProduct {
  id: string;
  name: string;
  image: string;
  logoPosition: {
    top: string;
    left: string;
    width: string;
    transform?: string;
  };
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedAsset {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface ColorPalette {
  name: string;
  colors: string[]; // hex codes
  description: string;
}

export interface BrandKit {
  primaryColor: string;
  palettes: ColorPalette[];
}
