import { useCallback } from 'react';
import { apiClient } from './api';

// Hook който предоставя API методи за React компоненти
export const useApi = () => {
  const get = useCallback((path) => {
    return apiClient.get(path);
  }, []);

  const post = useCallback((path, data) => {
    return apiClient.post(path, data);
  }, []);

  const put = useCallback((path, data) => {
    return apiClient.put(path, data);
  }, []);

  const deleteRequest = useCallback((path) => {
    return apiClient.delete(path);
  }, []);

  const patch = useCallback((path, data) => {
    return apiClient.patch(path, data);
  }, []);

  return {
    get,
    post,
    put,
    delete: deleteRequest,
    patch,
    // Директен достъп до клиента при нужда
    client: apiClient
  };
};
