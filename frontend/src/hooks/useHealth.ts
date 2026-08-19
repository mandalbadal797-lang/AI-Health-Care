import { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService';
import { HealthData } from '../types/api';

export function useHealth() {
  const [data, setData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const healthData = await healthService.getHealth();
      setData(healthData);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return {
    data,
    isLoading,
    error,
    isConnected: !!data && data.status === 'ok',
    refetch: fetchHealth,
  };
}
