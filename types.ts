export enum Category {
  General = 'General',
  Business = 'Business',
  Technology = 'Technology',
  Entertainment = 'Entertainment',
  Sports = 'Sports',
  Science = 'Science',
  Health = 'Health',
  Politics = 'Politics',
  World = 'World',
  // Fix: Add Lifestyle to Category enum as it is used in DashboardWidgets
  Lifestyle = 'Lifestyle'
}

export enum AppView {
  Feed = 'FEED',
  Categories = 'CATEGORIES',
  Search = 'SEARCH',
  Bookmarks = 'BOOKMARKS',
  Settings = 'SETTINGS',
  Creator = 'CREATOR',
  Admin = 'ADMIN',
  AutoPilot = 'AUTOPILOT'
}

export interface AutoPilotConfig {
  enabled: boolean;
  dailyPostLimit: number;
  frequencyMinutes: 10 | 15 | 30;
  sources: { id: string; url: string; type: 'rss' | 'api'; active: boolean }[];
  aiPrompt: string;
  categoryDistribution: {
    Trending: number; // General
    Business: number;
    Tech: number;     // Technology
    Local: number;    // Local/General
  };
  autoApprove: boolean;
  duplicateFilter: boolean;
  titleSimilarityCheck: boolean;
  scheduleSlots: { morning: boolean; afternoon: boolean; evening: boolean };
}

export interface AutoPilotLog {
  id: string;
  timestamp: any;
  action: 'FETCH' | 'GENERATE' | 'PUBLISH' | 'ERROR';
  message: string;
  details?: string;
}

export interface AutoPilotStats {
  todayPosts: number;
  successCount: number;
  failedCount: number;
  lastResetDate: string; // YYYY-MM-DD
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string; // Max 60 words
  fullStoryUrl: string;
  sourceName: string;
  category: string;
  publishedTime: string;
  imageUrl?: string; // We will generate a placeholder if needed
  status?: 'published' | 'draft' | 'under_review';
  views?: number;
  earnings?: number;
}

export interface Poll {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  userVoted?: number; // index of option
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'creator' | 'admin';
  earnings?: number;
}

export interface AdminNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    createdAt: any;
}

export interface AdminCampaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'ended';
    budget: number;
    startDate: any;
}

export interface AdminPopup {
    id: string;
    content: string;
    imageUrl?: string;
    link?: string;
    active: boolean;
    displayIntervalSeconds: number;
}

export type FeedItem = 
  | { type: 'news'; data: NewsItem }
  | { type: 'poll'; data: Poll };