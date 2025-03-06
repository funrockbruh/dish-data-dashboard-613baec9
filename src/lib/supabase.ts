
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uuvpagsucqabvkhqlbwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dnBhZ3N1Y3FhYnZraHFsYndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTMwMzEsImV4cCI6MjA1NDA4OTAzMX0.xPk-7b1yCluddTQ2bFhWENP1DwAYGdEF5jwIyL5bom8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable-menu'
    }
  }
});
