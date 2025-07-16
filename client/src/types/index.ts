export interface Position {
  id: string;
  timestamp: string; // ISO string format
  latitude: number;
  longitude: number;
}

export interface CreatePositionRequest {
  latitude: number;
  longitude: number;
}

export interface UpdatePositionRequest {
  latitude?: number;
  longitude?: number;
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
  duration: number; // in days
  totalPositions: number;
  currentPosition?: Position;
}