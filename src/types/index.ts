export type FruitKind = 'watermelon' | 'orange' | 'apple' | 'lemon' | 'kiwi' | 'dragonfruit' | 'bomb';

export interface BladeStyle {
  id: string;
  name: string;
  color: string;
  trailColor: string;
  glowColor: string;
  description: string;
}

export type GameMode = 'zen' | 'arcade';

export interface ColorTheme {
  id: string;
  name: string;
  accent: string;
  gradientText: string;
  backgroundGlow: string;
  ambientLightHex: number;
  dirLightHex: number;
}

export interface JuiceRecipe {
  id: string;
  name: string;
  tagline: string;
  requiredFruits: Partial<Record<FruitKind, number>>;
  color: string;
  accentGradient: string;
  icon: string;
}
