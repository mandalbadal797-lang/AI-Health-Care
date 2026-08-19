import { apiClient } from './apiClient';
import { HealthData } from '../types/api';

export const healthService = {
  async getHealth(): Promise<HealthData> {
    const response = await apiClient.get<HealthData>('/health');
    return (response as any).data || response;
  },
};
