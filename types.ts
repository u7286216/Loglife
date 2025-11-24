
export interface JournalEntry {
  id: string;
  date: string; // ISO String
  title: string;
  content: string;
  songOfTheDay: string;
  images: string[]; // Changed from single image string to array
  tags: string[];
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
  
  // AI Generated Fields
  theme?: string;
  hexColor?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  streak: number;
  lastUpdated: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  content: string;
}

export enum AppView {
  FEED = 'FEED',
  DASHBOARD = 'DASHBOARD',
  NEW_ENTRY = 'NEW_ENTRY',
  SETTINGS = 'SETTINGS',
  ENTRY_DETAIL = 'ENTRY_DETAIL',
  CHAT = 'CHAT'
}

export interface VibeCheckResult {
  theme: string;
  hexColor: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}