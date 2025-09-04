import axios from 'axios';
import { authService } from './auth.service';
import { Person } from '../interfaces/person.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TrackedPersonEntry {
    id: number;
    userId: number;
    dataAxleId: string;
    personData: Person;
    createdAt: string;
    updatedAt: string;
}

class TrackingService {
  private _getAuthHeaders() {
    const token = authService.getAuthToken();
    if (!token) throw new Error('Authentication token not found.');
    return { 'Authorization': `Bearer ${token}` };
  }

  async trackPerson(personData: Person): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tracking`, { personData }, {
        headers: this._getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to track person:', error);
      throw error;
    }
  }

  async untrackPerson(dataAxleId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/tracking/${dataAxleId}`, {
        headers: this._getAuthHeaders()
      });
    } catch (error) {
      console.error('Failed to untrack person:', error);
      throw error;
    }
  }

  async getTrackedPeople(): Promise<TrackedPersonEntry[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking`, {
        headers: this._getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tracked people:', error);
      throw error;
    }
  }

  async getTrackingStatus(dataAxleId: string): Promise<{ isTracking: boolean }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tracking/status/${dataAxleId}`, {
        headers: this._getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tracking status:', error);
      throw error;
    }
  }
}

export const trackingService = new TrackingService();