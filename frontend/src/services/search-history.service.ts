import axios from 'axios';
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SearchHistoryEntry {
  id: number;
  date: string;
  keyword: string;
  type: 'phone' | 'email' | 'name' | 'address';
  resultType: 'set' | 'single' | 'empty';
  response: any;
  sort: any;
  offset: number;
  page: number;
  count: number;
  filters?: any;
}

export interface PaginatedHistoryResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  history: SearchHistoryEntry[];
}

class SearchHistoryService {
  async saveSearch(searchData: any): Promise<void> {
    const token = authService.getAuthToken();
    if (!token) {
      console.error('Authentication token not found.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/history`, searchData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error: any) {
      console.error('Failed to save search history:', error);
      
      // Si es un error de créditos insuficientes, lanzar un error específico
      if (error.response?.status === 400 && error.response?.data?.error === 'Insufficient credits') {
        throw new Error(`Insufficient credits: ${error.response.data.details.availableCredits} available, ${error.response.data.details.requestedCredits} requested`);
      }
      
      throw error;
    }
  }

  async getHistory(page = 1, limit = 10): Promise<PaginatedHistoryResponse> {
    const token = authService.getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch search history:', error);
      throw error;
    }
  }
}

export const searchHistoryService = new SearchHistoryService();