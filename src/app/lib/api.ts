// API Base URL - Render'daki backend adresi
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ikiz-gelisim-api.onrender.com';

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const baseUrl = API_BASE_URL.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'omit' // We use Bearer tokens
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    } catch (error: any) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}

// Shorthand methods
export const api = {
    get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    put: (endpoint: string, body: any) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' })
};

export default api;
