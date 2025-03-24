
import { useParams } from "react-router-dom";
import { usePublicMenu } from "@/hooks/public-menu";
import { PublicMenuHeader } from "@/components/public-menu/PublicMenuHeader";
import { FeaturedSection } from "@/components/public-menu/FeaturedSection";
import { CategoriesSection } from "@/components/public-menu/CategoriesSection";
import { MenuItemsSection } from "@/components/public-menu/MenuItemsSection";
import { EmptyMenuState } from "@/components/menu/EmptyMenuState";
import { useEffect } from "react";

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
        <PublicMenuHeader 
          restaurant={null} 
          menuItems={[]}
          formatPrice={formatPrice}
        />
        <div className="p-4 flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !restaurant)) {
    return (
      <div className="bg-black min-h-screen text-white">
        <PublicMenuHeader 
          restaurant={null} 
          menuItems={[]}
          formatPrice={formatPrice}
        />
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

  return (
    <div className="bg-black text-white min-h-screen">
      <PublicMenuHeader 
        restaurant={restaurant} 
        menuItems={menuItems}
        formatPrice={formatPrice} 
      />
      
      <main className="container mx-auto p-4 pb-20">
        {featuredItems.length > 0 && (
          <FeaturedSection 
            featuredItems={featuredItems} 
            formatPrice={formatPrice} 
          />
        )}
        
        {categories.length > 0 && (
          <CategoriesSection categories={categories} />
        )}
        
        <MenuItemsSection 
          menuItems={menuItems} 
          categories={categories}
          formatPrice={formatPrice} 
        />
      </main>
    </div>
  );
};

export default PublicMenu;
