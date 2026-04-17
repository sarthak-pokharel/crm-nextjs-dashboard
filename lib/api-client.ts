const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:11177/api';

export const createFetchWithAuth = (token?: string) => {
  return async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers instanceof Headers
        ? Object.fromEntries((options.headers as Headers).entries())
        : Array.isArray(options.headers)
        ? Object.fromEntries(options.headers as [string, string][])
        : (options.headers as Record<string, string> | undefined) ?? {}),
    };

    // Get token from localStorage if not provided
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Add current organization context from localStorage
    if (typeof window !== 'undefined') {
      const currentOrgId = localStorage.getItem('currentOrgId');
      if (currentOrgId) {
        headers['x-crm-org-id'] = currentOrgId;
      }
    }

    const fullUrl = `${API_URL}${url}`;
    console.debug(`[API] ${options.method || 'GET'} ${fullUrl}`);

    const response = await fetch(fullUrl, {
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
      console.error(`[API Error] ${fullUrl}:`, error.errors);
      throw error;
    }

    // Handle empty responses (e.g., DELETE 200/204 with no body)
    const contentLength = response.headers.get('content-length');
    if (response.status === 204 || contentLength === '0' || contentLength === null) {
      console.debug(`[API Response] ${fullUrl}: <empty>`);
      return null;
    }

    const data = await response.json();
    console.debug(`[API Response] ${fullUrl}:`, data);
    return data;
  };
};

export const apiClient = createFetchWithAuth();

export { API_URL };
