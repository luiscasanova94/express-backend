import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiClientOptions } from '../interfaces/api.interface';


export class ApiClient {
  private client: AxiosInstance;

  constructor(options: ApiClientOptions) {
    this.client = axios.create({
      baseURL: options.baseURL,
      headers: {
        ...options.headers,
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API call error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, { ...config, params });
    return response.data;
  }

  public async post<T>(url: string, data: object, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data: object, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}