export type TabType = 'tasks' | 'notes' | 'timer' | 'tools' | 'blueprints';

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category: string;
  dueDate?: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  isPinned: boolean;
  updatedAt: number;
}

export interface AppIdeaTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  promptExample: string;
}
