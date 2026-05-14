const API_BASE_URL = '/api/proxy';

const AUTH_CREDENTIALS = {
  phone_number: process.env.NEXT_PUBLIC_AUTH_PHONE_NUMBER,
  username: process.env.NEXT_PUBLIC_AUTH_USERNAME,
  password: process.env.NEXT_PUBLIC_AUTH_PASSWORD,
  name: process.env.NEXT_PUBLIC_AUTH_NAME
};

export async function login() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  const token = data.access_token;

  if (token) {
    localStorage.setItem('canting_token', token);
    localStorage.setItem('canting_token_expiry', (Date.now() + 1440 * 60 * 1000).toString());
  }

  return token;
}

export async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  let token = localStorage.getItem('canting_token');
  const expiry = localStorage.getItem('canting_token_expiry');

  if (!token || (expiry && Date.now() > parseInt(expiry))) {
    token = await login();
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    token = await login();
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...options.headers, 'Authorization': `Bearer ${token}` },
    });
  }

  return response;
}