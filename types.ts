
export enum ExamType {
  JAMB = 'JAMB',
  WAEC = 'WAEC',
  NECO = 'NECO'
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  STUDY = 'STUDY',
  EXAM_SIMULATOR = 'EXAM_SIMULATOR',
  TIMETABLE = 'TIMETABLE',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  RESULTS = 'RESULTS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  COMPLAINTS = 'COMPLAINTS'
}

export interface AppNotification {
  id: string;
  type: 'CRITICAL' | 'REMINDER' | 'AI_INSIGHT';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  context: string;
  hints: string[];
}

export interface QuizResult {
  score: number;
  total: number;
  answers: Record<number, number>;
  questions: Question[];
  examType: ExamType;
  timeSpent: number;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export interface ActivitySession {
  id: string;
  timestamp: string;
  context: string;
  messages: ChatMessage[];
}

export interface UserProfile {
  name: string;
  email?: string;
  isAuthenticated: boolean;
  isVerified: boolean;
  verificationCode?: string;
  hasCompletedOnboarding: boolean;
  targetExam: ExamType;
  studyGoal: string;
  memories: string[];
  activities: ActivitySession[];
  interactionStyle: 'DETAILED' | 'CONCISE' | 'NEUTRAL';
  isChatbotEnabled: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface StudySession {
  day: string;
  topic: string;
  startTime: string;
  endTime: string;
}

export interface StudyMaterial {
  id: string;
  name: string;
  type: string;
  content: string;
}
