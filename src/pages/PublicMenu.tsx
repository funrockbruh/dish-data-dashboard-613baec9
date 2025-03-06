
import { useParams } from "react-router-dom";
import { usePublicMenu } from "@/hooks/use-public-menu";
import { PublicMenuHeader } from "@/components/public-menu/PublicMenuHeader";
import { FeaturedSection } from "@/components/public-menu/FeaturedSection";
import { CategoriesSection } from "@/components/public-menu/CategoriesSection";
import { MenuItemsSection } from "@/components/public-menu/MenuItemsSection";
import { EmptyMenuState } from "@/components/menu/EmptyMenuState";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const PublicMenu = () => {
  const { restaurantName } = useParams<{ restaurantName: string }>();
  const { 
    restaurant, 
    categories, 
    menuItems, 
    featuredItems, 
    isLoading, 
    error, 
    debugInfo,
    formatPrice 
  } = usePublicMenu(restaurantName);

  // Get current authentication status for debugging
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Auth status:", data.session ? "Authenticated" : "Not authenticated");
    };
    
    checkAuth();
  }, []);

  // Log the state for debugging
  useEffect(() => {
    console.log("Public Menu State:", {
      restaurant,
      menuItems: menuItems.length,
      categories: categories.length,
      featuredItems: featuredItems.length,
      error
    });
    
    if (menuItems.length > 0) {
      console.log("Sample menu item:", menuItems[0]);
    }
    
    if (debugInfo) {
      console.log("Debug info:", debugInfo);
    }
  }, [restaurant, menuItems, categories, featuredItems, error, debugInfo]);

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <PublicMenuHeader restaurant={null} />
        <div className="p-4 flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !restaurant)) {
    return (
      <div className="bg-black min-h-screen text-white">
        <PublicMenuHeader restaurant={null} />
        <div className="container mx-auto p-4">
          <EmptyMenuState 
            restaurantId={restaurant?.id || ''} 
            restaurantName={restaurantName || ''} 
            debugInfo={debugInfo}
          />
        </div>
      </div>
    );
  }

  // If we have a restaurant but no menu items, show a simplified empty state
  if (!isLoading && restaurant && menuItems.length === 0 && categories.length === 0) {
    return (
      <div className="bg-black min-h-screen text-white">
        <PublicMenuHeader restaurant={restaurant} />
        <div className="container mx-auto p-4">
          <div className="text-center p-8 bg-gray-900 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2">No Menu Items Found</h2>
            <p className="text-gray-400">
              This restaurant doesn't have any menu items yet.
            </p>
            {debugInfo && (
              <div className="mt-4 text-left text-xs text-gray-500">
                <details>
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 p-2 bg-gray-800 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <PublicMenuHeader restaurant={restaurant} />
      
      <main className="container mx-auto p-4 pb-20">
        <FeaturedSection 
          featuredItems={featuredItems} 
          formatPrice={formatPrice} 
        />
        
        <CategoriesSection categories={categories} />
        
        <MenuItemsSection 
          menuItems={menuItems} 
          formatPrice={formatPrice} 
        />
      </main>
    </div>
  );
};

export default PublicMenu;
