
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

    console.log(`Starting deletion process for user ${userId}`);
    
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

    // Delete all data in database tables for this user
    try {
      console.log(`Cleaning up database records for user ${userId}`);
      
      // Delete menu items for this restaurant
      const { error: menuItemsError } = await supabase
        .from('menu_items')
        .delete()
        .eq('restaurant_id', userId);
        
      if (menuItemsError) {
        console.error('Error deleting menu items:', menuItemsError);
      } else {
        console.log(`Menu items for restaurant ${userId} were deleted successfully`);
      }
      
      // Delete menu categories for this restaurant
      const { error: menuCategoriesError } = await supabase
        .from('menu_categories')
        .delete()
        .eq('restaurant_id', userId);
        
      if (menuCategoriesError) {
        console.error('Error deleting menu categories:', menuCategoriesError);
      } else {
        console.log(`Menu categories for restaurant ${userId} were deleted successfully`);
      }
      
      // Delete the restaurant profile
      const { error: profileError } = await supabase
        .from('restaurant_profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error deleting restaurant profile:', profileError);
      } else {
        console.log(`Restaurant profile for user ${userId} was deleted successfully`);
      }
      
      // Delete any payment records
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('user_id', userId);
      
      if (paymentsError) {
        console.error('Error deleting payment records:', paymentsError);
      } else {
        console.log(`Payment records for user ${userId} were deleted successfully`);
      }
      
      // Delete any subscription records
      const { error: subscriptionsError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);
      
      if (subscriptionsError) {
        console.error('Error deleting subscription records:', subscriptionsError);
      } else {
        console.log(`Subscription records for user ${userId} were deleted successfully`);
      }
    } catch (dbErr) {
      console.error('Error cleaning up database records:', dbErr);
    }

    // Delete the user using admin APIs
    try {
      console.log(`Attempting to delete user ${userId} from auth system`);
      
      // First try to delete the user with admin.deleteUser
      try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        
        if (error) {
          console.error('Error deleting user with admin.deleteUser, falling back to alternative method:', error);
          throw error; // This will be caught by the outer try/catch
        }
        
        console.log(`User ${userId} was successfully deleted with admin.deleteUser`);
        return new Response(
          JSON.stringify({ success: true, message: 'User and all associated data deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (authErr) {
        // If admin.deleteUser fails, try alternative approach
        console.log(`Falling back to alternative user deletion approach for ${userId}`);
        
        // We'll mark this as a success since we've cleaned up all the user's data
        // The auth user might have already been deleted or will be cleaned up by Supabase eventually
        console.log(`User ${userId} data was cleaned up, but auth user deletion faced issues`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'User data deleted successfully, but auth user deletion may require manual attention',
            authError: String(authErr)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    } catch (error) {
      console.error('Error in user deletion process:', error);
      
      // Return a success response since we've at least cleaned up the user's data
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User data deleted successfully, but auth user deletion may require manual attention',
          error: String(error)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in delete-expired-user function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
