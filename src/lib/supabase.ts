import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  // Provide default values for development to prevent app from crashing
  const defaultUrl = 'https://your-project-url.supabase.co';
  const defaultKey = 'your-anon-key';
  
  console.warn(`Using default Supabase configuration. Authentication will not work.
  Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.`);
  
  export const supabase = createClient(defaultUrl, defaultKey);
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
}