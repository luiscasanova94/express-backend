import axios from 'axios';
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }
}

export const searchHistoryService = new SearchHistoryService();