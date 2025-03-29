
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

// Create a server-side function to handle user deletion
export const handleUserExpiry = async (userId: string) => {
  try {
    console.log(`Invoking delete-expired-user function for userId: ${userId}`);
    
    // First create an edge function to delete the user
    const { data, error } = await supabase.functions.invoke('delete-expired-user', {
      body: { userId },
    });
    
    if (error) {
      console.error('Error invoking delete-expired-user function:', error);
      throw error;
    }
    
    console.log('User deletion successful:', data);
    return data;
  } catch (error) {
    console.error('Error invoking delete-expired-user function:', error);
    throw error;
  }
};
