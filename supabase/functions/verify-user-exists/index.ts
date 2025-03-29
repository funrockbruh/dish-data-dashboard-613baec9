
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Check if the user exists in auth.users
      const { data, error } = await supabase.auth.admin.getUserById(userId);

      if (error) {
        // Handle specific error about user not found
        if (error.message && error.message.toLowerCase().includes("user not found")) {
          console.log(`User ${userId} does not exist in auth.users`);
          return new Response(
            JSON.stringify({ exists: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        // Log any other errors but don't throw them
        console.error('Error getting user:', error);
        return new Response(
          JSON.stringify({ exists: false, message: 'Error checking user, assuming they don\'t exist' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // If we get here, the user exists
      const userExists = !!data.user;
      console.log(`User ${userId} exists in auth.users: ${userExists}`);

      return new Response(
        JSON.stringify({ exists: userExists }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (authError) {
      // Catch any unexpected errors when checking the user
      console.error('Unexpected error checking user:', authError);
      
      // In case of any errors, assume the user doesn't exist
      return new Response(
        JSON.stringify({ exists: false, message: 'Error checking user, assuming they don\'t exist' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Error verifying user existence:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
