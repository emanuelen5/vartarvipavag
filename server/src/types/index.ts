export interface Note {
  id: string;
  text: string;
  timestamp: string;
  source: 'telegram' | 'manual' | 'home_assistant';
  telegram_user?: string;
}

export interface Position {
  id: string;
  timestamp: string; // ISO string format
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  notes: Note[];
  source: 'home_assistant' | 'telegram' | 'manual';
}

export interface CreatePositionRequest {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  notes?: string; // Legacy support - will be converted to Note object
  source?: 'home_assistant' | 'telegram' | 'manual';
}

export interface UpdatePositionRequest {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  notes?: string; // Legacy support
}

export interface AddNoteRequest {
  text: string;
  source?: 'telegram' | 'manual';
  telegram_user?: string;
}



export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PositionWithDistance extends Position {
  distanceFromPrevious?: number; // in kilometers
} 