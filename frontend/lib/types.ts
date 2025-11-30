export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  weight: number;
  gender: Gender | 'male' | 'female' | 'other';
  diagnoses: { text: string; isMain: boolean }[];
  allergies: string[];
  roomNumber?: string;
  notes?: string;
  age?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export enum TodoCategory {
  BEATMUNG = 'Beatmung',
  ERNAEHRUNG = 'Ernährung',
  BEWEGUNG = 'Bewegung',
  AUSSCHEIDUNG = 'Ausscheidung',
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  category: TodoCategory;
  priority: TodoPriority;
  dueDate: Date | string;
  completed: boolean;
  completedAt?: Date | string;
  notificationSent: boolean;
  patientId: string;
  patient?: Patient;
  assignedToId?: string;
  assignedTo?: User;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export enum NotificationType {
  TODO_REMINDER = 'todo_reminder',
  TODO_OVERDUE = 'todo_overdue',
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  readAt?: Date | string;
  userId: string;
  todoId?: string;
  todo?: Todo;
  createdAt: Date | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
