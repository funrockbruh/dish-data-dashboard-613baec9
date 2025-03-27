
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

    // Create admin user
    const adminEmail = "mhdya7739@gmail.com";
    const adminPassword = "03888506Mo$"; // This should be a secure password

    // Check if user already exists
    const { data: existingUser, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (searchError) {
      console.error("Error checking for existing user:", searchError);
      return new Response(JSON.stringify({ error: searchError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const existingAdmin = existingUser.users.find(user => user.email === adminEmail);
    
    let userId;
    if (existingAdmin) {
      userId = existingAdmin.id;
      console.log("Admin user already exists with ID:", userId);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Auto-confirm email
      });

      if (createError) {
        console.error("Error creating admin user:", createError);
        return new Response(JSON.stringify({ error: createError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      userId = newUser.user.id;
      console.log("Created admin user with ID:", userId);
    }

    // Ensure admin is in the admin_users table
    const { error: tableError } = await supabaseAdmin
      .from("admin_users")
      .upsert(
        { email: adminEmail },
        { onConflict: "email" }
      );

    if (tableError) {
      console.error("Error updating admin_users table:", tableError);
      return new Response(JSON.stringify({ error: tableError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ success: true, userId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
