
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

    // Important: Delete in correct order to avoid foreign key constraints
    // 1. First delete menu items
    console.log(`Attempting to delete menu items for user ${userId}`);
    const { error: menuItemsDeleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('restaurant_id', userId);

    if (menuItemsDeleteError) {
      console.error('Error deleting menu items:', menuItemsDeleteError);
    } else {
      console.log(`Menu items for restaurant ${userId} were deleted successfully`);
    }

    // 2. Then delete menu categories
    console.log(`Attempting to delete menu categories for user ${userId}`);
    const { error: menuCategoriesDeleteError } = await supabase
      .from('menu_categories')
      .delete()
      .eq('restaurant_id', userId);

    if (menuCategoriesDeleteError) {
      console.error('Error deleting menu categories:', menuCategoriesDeleteError);
    } else {
      console.log(`Menu categories for restaurant ${userId} were deleted successfully`);
    }

    // 3. Delete restaurant profile
    console.log(`Attempting to delete restaurant profile for user ${userId}`);
    const { error: profileDeleteError } = await supabase
      .from('restaurant_profiles')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      console.error('Error deleting restaurant profile:', profileDeleteError);
      // Don't proceed with user deletion if we couldn't delete the profile
      return new Response(
        JSON.stringify({ error: 'Failed to delete restaurant profile', details: profileDeleteError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    } else {
      console.log(`Restaurant profile for user ${userId} was deleted successfully`);
    }

    // 4. Finally, delete the user from auth system
    console.log(`Attempting to delete user ${userId} from auth system`);
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user from auth system:', error);
      throw error;
    }

    // Log the successful deletion
    console.log(`User ${userId} was automatically deleted due to expired subscription`);

    // Return a success response
    return new Response(
      JSON.stringify({ success: true, message: 'User and associated data deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error deleting user:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
