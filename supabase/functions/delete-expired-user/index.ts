
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
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up all storage buckets for the user
    const bucketNames = ['menu-item-images', 'menu-category-images', 'restaurant-logos'];
    
    console.log(`Starting storage cleanup for user ${userId}`);
    
    // Delete files from each bucket
    for (const bucketName of bucketNames) {
      try {
        console.log(`Processing bucket ${bucketName} for user ${userId}`);
        
        // List all files in the user's folder
        const { data: files, error: listError } = await supabase
          .storage
          .from(bucketName)
          .list(userId);
          
        if (listError) {
          console.error(`Error listing files in ${bucketName}/${userId}:`, listError);
          continue;
        }
        
        if (files && files.length > 0) {
          console.log(`Found ${files.length} files in ${bucketName}/${userId}`);
          
          // Get file paths to delete
          const filePaths = files.map(file => `${userId}/${file.name}`);
          
          // Delete files in batch
          const { error: deleteError } = await supabase
            .storage
            .from(bucketName)
            .remove(filePaths);
              
          if (deleteError) {
            console.error(`Error deleting files from ${bucketName}/${userId}:`, deleteError);
          } else {
            console.log(`Successfully deleted ${filePaths.length} files from ${bucketName}/${userId}`);
          }
        } else {
          console.log(`No files found in ${bucketName}/${userId}`);
        }
        
        // Try to remove the empty folder itself
        // Note: This may not always work as expected since folders are virtual in object storage
        try {
          const { error: folderError } = await supabase
            .storage
            .from(bucketName)
            .remove([`${userId}`]);
            
          if (folderError) {
            console.log(`Note: Folder removal attempt for ${bucketName}/${userId} returned:`, folderError);
          } else {
            console.log(`Successfully removed folder ${bucketName}/${userId}`);
          }
        } catch (folderErr) {
          console.log(`Note: Error attempting to remove folder ${bucketName}/${userId}:`, folderErr);
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
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
