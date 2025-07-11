import axios from 'axios';
import seedrandom from 'seedrandom';
import { ApiResponse, Position } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response?.status === 403) {
      console.error('Write operations are restricted to localhost');
    }
    
    return Promise.reject(error);
  }
);

const rng = seedrandom("42"); // Create a seeded random number generator

/**
 * Randomize a position based on its ID using a static seed.
 * @param id - The unique ID of the position.
 * @param position - The original position to randomize.
 * @returns A randomized position.
 */
export function randomizePosition(position: Position): Position {
  const latOffset = (rng() * 0.008) - 0.004; // Latitude offset in range [-0.01, 0.01]
  const lonOffset = (rng() * 0.008) - 0.004; // Longitude offset in range [-0.01, 0.01]
  return {
    ...position,
    latitude: position.latitude + latOffset,
    longitude: position.longitude + lonOffset,
  };
}

export class PositionService {
  /**
   * Fetch all positions from the API
   */
  static async getAllPositions(): Promise<Position[]> {
    try {
      const response = await api.get<ApiResponse<Position[]>>('/api/positions');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch positions');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  /**
   * Check server health
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export default PositionService; 