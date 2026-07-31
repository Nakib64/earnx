import { useState, useEffect, useCallback } from 'react';
import { apiFetch, ApiFetchOptions } from '../lib/api';

export interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApiQuery<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<T>(endpoint, options);
    if (res.success && res.data !== null) {
      setData(res.data);
    } else {
      setError(res.error?.message || 'Failed to fetch data');
    }
    setLoading(false);
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, setData };
}
