const BASE_URL = 'http://localhost:3001';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Handle 401 Unauthorized globally if needed (e.g. redirect to login)
        if (response.status === 401 && typeof window !== 'undefined') {
            // window.location.href = '/login'; // Optional: Auto-redirect
        }
        const errorBody = await response.text();
        throw new Error(errorBody || `API Error ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: (endpoint: string) => apiFetch(endpoint, { method: 'GET' }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    put: (endpoint: string, body: any) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    del: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
};
