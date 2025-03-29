
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

// Handle user deletion with improved error handling and logging
export const handleUserExpiry = async (userId: string) => {
  try {
    console.log(`Initiating complete deletion process for user: ${userId}`);
    
    // Create a promise with timeout to handle potential edge function hanging
    const timeoutDuration = 20000; // 20 seconds timeout
    
    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        // Invoke the edge function to delete the user and all associated data
        const { data, error } = await supabase.functions.invoke('delete-expired-user', {
          body: { userId },
        });
        
        if (error) {
          console.error('Error invoking delete-expired-user function:', error);
          reject(error);
        } else {
          console.log('User deletion completed successfully:', data);
          resolve(data);
        }
      } catch (fnError) {
        console.error('Exception during function invocation:', fnError);
        reject(fnError);
      }
    });
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`User deletion timed out after ${timeoutDuration}ms`));
      }, timeoutDuration);
    });
    
    // Race the deletion promise against the timeout
    const result = await Promise.race([deletePromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('Error during user expiry handling:', error);
    // We still return something to prevent further cascading errors
    return { success: false, error: error.message };
  }
};
