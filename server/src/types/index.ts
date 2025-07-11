export interface Position {
  id: string;
  timestamp: string; // ISO string format
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  notes?: string;
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