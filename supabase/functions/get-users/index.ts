
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with admin role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // This would be the code to fetch users but it won't work without the service role key
    // Returning mock data for now
    
    // In a production environment, we'd use this code:
    // const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    // if (error) throw error;
    
    // For demonstration purposes, return mock data
    const mockUsers = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        email: "user1@example.com",
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        email: "user2@example.com",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return new Response(JSON.stringify(mockUsers), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
