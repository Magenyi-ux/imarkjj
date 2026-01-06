
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
  RESULTS = 'RESULTS'
}

export interface QuestionDeconstruction {
  logic: string;
  mnemonic: string;
  atomic: string[];
  roadmap: string;
  scenario: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  context: string;
  deconstruction: QuestionDeconstruction;
}

export interface Activity {
  id: string;
  type: 'CHAT_SNIPPET' | 'EXAM_RESULT' | 'STUDY_NOTE';
  title: string;
  content: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  targetExam: ExamType;
  studyGoal: string;
  memories: string[];
  interactionStyle: 'DETAILED' | 'CONCISE' | 'NEUTRAL';
  location?: {
    latitude: number;
    longitude: number;
  };
  activities: Activity[];
  chatbotEnabled: boolean;
}

export interface StudySession {
  id: string;
  day: string;
  topic: string;
  startTime: string;
  endTime: string;
  mastery: number; // 0 to 100
  resources?: { title: string, url: string }[];
}

export interface StudyMaterial {
  id: string;
  name: string;
  type: string;
  content: string;
}
