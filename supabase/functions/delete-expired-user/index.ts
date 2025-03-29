
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

    // Clean up all storage buckets for the user
    const bucketNames = ['menu-item-images', 'menu-category-images', 'restaurant-logos'];
    
    console.log(`Attempting to clean up storage for user ${userId}`);
    
    // Delete files from each bucket
    for (const bucketName of bucketNames) {
      try {
        // List all files in the user's folder
        const { data: files, error: listError } = await supabase
          .storage
          .from(bucketName)
          .list(`${userId}`);
          
        if (listError) {
          console.error(`Error listing files in ${bucketName}/${userId}:`, listError);
          continue;
        }
        
        if (files && files.length > 0) {
          console.log(`Found ${files.length} files in ${bucketName}/${userId}`);
          
          // Delete each file individually
          for (const file of files) {
            const filePath = `${userId}/${file.name}`;
            const { error: deleteError } = await supabase
              .storage
              .from(bucketName)
              .remove([filePath]);
              
            if (deleteError) {
              console.error(`Error deleting file ${filePath}:`, deleteError);
            } else {
              console.log(`Successfully deleted ${filePath}`);
            }
          }
        } else {
          console.log(`No files found in ${bucketName}/${userId}`);
        }
        
        // Try to remove the empty folder
        try {
          const { error: folderError } = await supabase
            .storage
            .from(bucketName)
            .remove([`${userId}/`]);
            
          if (folderError) {
            console.log(`Note: Empty folder removal returned error (this is often normal):`, folderError);
          } else {
            console.log(`Successfully removed empty folder ${bucketName}/${userId}/`);
          }
        } catch (folderErr) {
          console.log(`Note: Error removing folder ${bucketName}/${userId}/ (this is often normal):`, folderErr);
        }
      } catch (bucketErr) {
        console.error(`Error processing bucket ${bucketName}:`, bucketErr);
      }
    }

    // Delete menu items for this restaurant
    try {
      const { error: menuItemsError } = await supabase
        .from('menu_items')
        .delete()
        .eq('restaurant_id', userId);
        
      if (menuItemsError) {
        console.error('Error deleting menu items:', menuItemsError);
      } else {
        console.log(`Menu items for restaurant ${userId} were deleted successfully`);
      }
    } catch (err) {
      console.error('Error deleting menu items:', err);
    }
    
    // Delete menu categories for this restaurant
    try {
      const { error: menuCategoriesError } = await supabase
        .from('menu_categories')
        .delete()
        .eq('restaurant_id', userId);
        
      if (menuCategoriesError) {
        console.error('Error deleting menu categories:', menuCategoriesError);
      } else {
        console.log(`Menu categories for restaurant ${userId} were deleted successfully`);
      }
    } catch (err) {
      console.error('Error deleting menu categories:', err);
    }
    
    // Delete the restaurant profile
    try {
      const { error: profileError } = await supabase
        .from('restaurant_profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error deleting restaurant profile:', profileError);
      } else {
        console.log(`Restaurant profile for user ${userId} was deleted successfully`);
      }
    } catch (err) {
      console.error('Error deleting restaurant profile:', err);
    }

    // Delete the user using admin APIs
    try {
      console.log(`Attempting to delete user ${userId} from auth system`);
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error('Error deleting user from auth system:', error);
        throw error;
      }
      
      console.log(`User ${userId} was automatically deleted due to expired subscription`);
    } catch (authErr) {
      console.error('Error deleting user:', authErr);
      throw authErr;
    }

    // Return a success response
    return new Response(
      JSON.stringify({ success: true, message: 'User and all associated data deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in delete-expired-user function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
