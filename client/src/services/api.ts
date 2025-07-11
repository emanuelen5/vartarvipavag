import axios from 'axios';
import { Position, ApiResponse, CreatePositionRequest, UpdatePositionRequest } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

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
   * Fetch a single position by ID
   */
  static async getPositionById(id: string): Promise<Position> {
    try {
      const response = await api.get<ApiResponse<Position>>(`/api/positions/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch position');
      }
      
      if (!response.data.data) {
        throw new Error('Position not found');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching position:', error);
      throw error;
    }
  }

  /**
   * Create a new position (localhost only)
   */
  static async createPosition(position: CreatePositionRequest): Promise<Position> {
    try {
      const response = await api.post<ApiResponse<Position>>('/api/positions', position);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create position');
      }
      
      if (!response.data.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating position:', error);
      throw error;
    }
  }

  /**
   * Update a position (localhost only)
   */
  static async updatePosition(id: string, updates: UpdatePositionRequest): Promise<Position> {
    try {
      const response = await api.put<ApiResponse<Position>>(`/api/positions/${id}`, updates);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update position');
      }
      
      if (!response.data.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating position:', error);
      throw error;
    }
  }

  /**
   * Delete a position (localhost only)
   */
  static async deletePosition(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/api/positions/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete position');
      }
    } catch (error) {
      console.error('Error deleting position:', error);
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