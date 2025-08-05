export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }
};
