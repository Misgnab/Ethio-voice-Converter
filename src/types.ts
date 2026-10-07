export type LanguageCode = 'am' | 'ti' | 'om' | 'en';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  speakers: string;
  script: string;
  description: string;
  sampleText: string;
}

export type VoiceGender = 'female' | 'male' | 'child';

export interface Voice {
  id: string;
  name: string;
  nativeName: string;
  language: LanguageCode;
  gender: VoiceGender;
  accent: string;
  region: string;
  persona: string;
  sampleText: string;
  description: string;
  isPopular?: boolean;
  isPremium?: boolean;
  audioSampleUrl?: string;
  pitch: number; // default pitch 0.8 - 1.4
  speed: number; // default pace 0.8 - 1.2
}

export interface HistoryItem {
  id: string;
  text: string;
  language: LanguageCode;
  voiceId: string;
  voiceName: string;
  date: string;
  duration: number;
  wordCount: number;
  charCount: number;
  category: string;
  favorite: boolean;
  format: 'mp3' | 'wav' | 'aac';
  quality: 'low' | 'standard' | 'hd';
  audioUrl: string;
  sizeKb: number;
  engine?: string;
}

export interface PresetTemplate {
  id: string;
  title: string;
  titleNative?: string;
  category: string;
  language: LanguageCode;
  text: string;
  source?: string;
}

export interface AdminStats {
  dailyActiveUsers: number;
  totalConversions: number;
  revenueChapa: number;
  revenueTelebirr: number;
  conversionTrend: { date: string; count: number }[];
  languageStats: {
    amharic: number;
    oromo: number;
    tigrinya: number;
    english: number;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  priceEtb: number;
  priceUsd: number;
  billingPeriod: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'accent';
}

export interface CommunityStory {
  id: string;
  author: string;
  role: string;
  location: string;
  story: string;
  avatarLetter: string;
  languageUsed: string;
  useCase: string;
}
