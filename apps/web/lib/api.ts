export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: 'GET', // Default to GET
    ...options,    // Allows 'method', 'body', etc., to override the default
    headers: { 
      'Content-Type': 'application/json',
      ...options.headers 
    },
    credentials: 'include', // CRITICAL for your NestJS + Better Auth setup
  });

  if (!res.ok) throw new Error('Unauthorized or Network Error');
  return res.json();
}