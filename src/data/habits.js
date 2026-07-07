import {
  Zap, Sun, Moon, Coffee, Code2, Music, HeartPulse, Leaf, Languages, Droplets,
} from 'lucide-react';

/* Shared vocabulary for user-defined habits. Icons are stored by key so the
 * definition in IndexedDB stays serialisable. */

export const HABIT_ICONS = {
  zap: Zap,
  sun: Sun,
  moon: Moon,
  coffee: Coffee,
  code: Code2,
  music: Music,
  heart: HeartPulse,
  leaf: Leaf,
  lang: Languages,
  water: Droplets,
};

export const HABIT_COLORS = [
  '#2DD4BF', '#FBBF24', '#60A5FA', '#FB7185',
  '#A78BFA', '#34D399', '#FB923C', '#F472B6',
];

export function habitIcon(key) {
  return HABIT_ICONS[key] || Zap;
}

export function newHabitId() {
  return `h_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
