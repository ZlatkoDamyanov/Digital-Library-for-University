const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Централизирана функция за HTTP заявки
async function request(method, path, data = null) {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Не задаваме Content-Type за FormData, браузърът го прави автоматично
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      method: method.toUpperCase(),
      headers,
    };

    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
      if (data instanceof FormData) {
        config.body = data;
      } else {
      config.body = JSON.stringify(data);
      }
    }

    const res = await fetch(`${API_URL}${path}`, config);
    
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.error || `HTTP error! status: ${res.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// API клиент обект с HTTP методи
const apiClient = {
  get: (path) => request('GET', path),
  post: (path, data) => request('POST', path, data),
  put: (path, data) => request('PUT', path, data),
  delete: (path) => request('DELETE', path),
  patch: (path, data) => request('PATCH', path, data),
};

export { apiClient, request };