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
  notes?: string;
}

export interface UpdatePositionRequest {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PositionWithDistance extends Position {
  distanceFromPrevious?: number; // in kilometers
}

export interface TravelStats {
  totalDistance: number;
  totalCountries: number;
  totalCities: number;
  duration: number; // in days
  currentPosition?: Position;
} 