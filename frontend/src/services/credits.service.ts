import axios from 'axios';
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreditsCheckResponse {
  available: boolean;
  availableCredits: number;
  totalUsed: number;
  limit: number;
  error?: string;
}

class CreditsService {
  async checkCredits(estimatedCredits?: number): Promise<CreditsCheckResponse> {
    const token = authService.getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/check-credits`, {
        estimatedCredits
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check credits:', error);
      throw error;
    }
  }

  async getCreditsLimit(): Promise<number> {
    return parseInt(import.meta.env.VITE_CREDITS_LIMIT || '1000', 10);
  }

}

export const creditsService = new CreditsService();
