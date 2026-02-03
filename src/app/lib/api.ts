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

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers
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
