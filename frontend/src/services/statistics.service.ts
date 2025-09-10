import axios from 'axios';
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface StatisticsResponse {
  totalQueries: number;
  totalCreditsUsed: number;
  startDate: string;
  endDate: string;
  creditsLimit: number;
}

class StatisticsService {
  async getStatistics(startDate?: string, endDate?: string): Promise<StatisticsResponse> {
    const token = authService.getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { startDate, endDate }
      });
      
      // Agregar el límite de créditos desde las variables de entorno
      const creditsLimit = parseInt(import.meta.env.VITE_CREDITS_LIMIT || '1000', 10);
      return {
        ...response.data,
        creditsLimit
      };
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    }
  }
}

export const statisticsService = new StatisticsService();