export interface Batch {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  subjects: Subject[];
  createdAt: Date;
  isActive: boolean;
  enrolledStudents: number;
  layout?: string;
}

export interface Subject {
  id: string;
  name: string;
  sections: Section[];
  thumbnail: string;
}

export interface Section {
  id: string;
  name:string;
  type: 'video' | 'notes' | 'assignment' | 'quiz';
  contents: Content[];
}

export interface Content {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'notes' | 'assignment' | 'quiz';
  thumbnail?: string;
  duration?: string;
  description?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  timeLimit: number;
  totalMarks: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface Assignment {
  id:string;
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
  attachments: string[];
}

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  scheduledTime: Date;
  videoUrl?: string;
  thumbnail: string;
  batchId: string;
  subjectId: string;
  isLive: boolean;
  createdAt: Date;
}
