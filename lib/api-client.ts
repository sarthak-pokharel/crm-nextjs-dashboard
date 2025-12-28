const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const createFetchWithAuth = (token?: string) => {
  return async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Get token from localStorage if not provided
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: any = new Error(`API error: ${response.statusText}`);
      try {
        error.data = await response.json();
        error.errors = error.data.errors || { general: error.data.message };
      } catch {
        error.errors = { general: response.statusText };
      }
      throw error;
    }

    return response.json();
  };
};

export const apiClient = createFetchWithAuth();

export { API_URL };
