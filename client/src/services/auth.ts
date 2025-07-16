// Simple auth state
export let apiKey: string | null = localStorage.getItem('apiKey');

export const setApiKey = (key: string | null) => {
  apiKey = key;
  if (key) {
    localStorage.setItem('apiKey', key);
  } else {
    localStorage.removeItem('apiKey');
  }
};

// Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
