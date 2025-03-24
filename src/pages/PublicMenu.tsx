
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
      themeSettings: restaurant?.theme_settings,
      error
    });
    
    if (menuItems.length > 0) {
      console.log("Sample menu item:", menuItems[0]);
    }
    
    if (debugInfo) {
      console.log("Debug info:", debugInfo);
    }
  }, [restaurant, menuItems, categories, featuredItems, error, debugInfo]);

  // Get theme settings
  const themeSettings = restaurant?.theme_settings;
  const isLightTheme = themeSettings?.isLightTheme !== false;
  const template = themeSettings?.template || "template1";

  // Background color based on light/dark theme
  const bgClass = isLightTheme ? "bg-gray-100 text-gray-900" : "bg-black text-white";

  if (isLoading) {
    return (
      <div className={bgClass + " min-h-screen"}>
        <PublicMenuHeader 
          restaurant={null} 
          menuItems={[]}
          formatPrice={formatPrice}
          themeSettings={themeSettings}
        />
        <div className="p-4 flex justify-center items-center h-[80vh]">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 ${isLightTheme ? 'border-gray-900' : 'border-white'}`}></div>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !restaurant)) {
    return (
      <div className={bgClass + " min-h-screen"}>
        <PublicMenuHeader 
          restaurant={null} 
          menuItems={[]}
          formatPrice={formatPrice}
          themeSettings={themeSettings}
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
    <div className={`${bgClass} min-h-screen`}>
      <PublicMenuHeader 
        restaurant={restaurant} 
        menuItems={menuItems}
        formatPrice={formatPrice}
        themeSettings={themeSettings}
      />
      
      <main className="container mx-auto p-4 pb-20">
        {featuredItems.length > 0 && (
          <FeaturedSection 
            featuredItems={featuredItems} 
            formatPrice={formatPrice}
            themeSettings={themeSettings}
          />
        )}
        
        {categories.length > 0 && (
          <CategoriesSection 
            categories={categories}
            themeSettings={themeSettings}
          />
        )}
        
        <MenuItemsSection 
          menuItems={menuItems} 
          categories={categories}
          formatPrice={formatPrice}
          themeSettings={themeSettings}
        />
      </main>
    </div>
  );
};

export default PublicMenu;
