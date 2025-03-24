
import { useParams } from "react-router-dom";
import { usePublicMenu } from "@/hooks/public-menu";
import { PublicMenuHeader } from "@/components/public-menu/PublicMenuHeader";
import { FeaturedSection } from "@/components/public-menu/FeaturedSection";
import { CategoriesSection } from "@/components/public-menu/CategoriesSection";
import { MenuItemsSection } from "@/components/public-menu/MenuItemsSection";
import { EmptyMenuState } from "@/components/menu/EmptyMenuState";
import { useEffect, useState } from "react";

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
  
  const [themeSettings, setThemeSettings] = useState<any>({});
  
  // Load theme settings
  useEffect(() => {
    const loadThemeSettings = () => {
      try {
        const settings = JSON.parse(localStorage.getItem('theme') || '{}');
        setThemeSettings(settings);
      } catch (err) {
        console.error("Error loading theme settings:", err);
      }
    };
    
    loadThemeSettings();
    
    // Check for theme settings when restaurant data loads
    if (restaurant?.theme_settings) {
      localStorage.setItem('theme', JSON.stringify(restaurant.theme_settings));
      setThemeSettings(restaurant.theme_settings);
    }
  }, [restaurant]);

  // Log the state for debugging
  useEffect(() => {
    console.log("Public Menu State:", {
      restaurant,
      menuItems: menuItems.length,
      categories: categories.length,
      featuredItems: featuredItems.length,
      error,
      themeSettings
    });
    
    if (menuItems.length > 0) {
      console.log("Sample menu item:", menuItems[0]);
    }
    
    if (debugInfo) {
      console.log("Debug info:", debugInfo);
    }
  }, [restaurant, menuItems, categories, featuredItems, error, debugInfo, themeSettings]);

  // Determine background style based on theme settings
  const getBackgroundStyle = () => {
    if (themeSettings.backgroundImage) {
      return {
        backgroundImage: `url(${themeSettings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (themeSettings.backgroundColor) {
      return { backgroundColor: themeSettings.backgroundColor };
    }
    return { backgroundColor: themeSettings.isLightTheme ? '#ffffff' : '#000000' };
  };

  // Base text color based on theme
  const textColor = themeSettings.isLightTheme ? 'text-black' : 'text-white';
  const bgClass = themeSettings.isLightTheme ? 'bg-white' : 'bg-black';

  if (isLoading) {
    return (
      <div className={`${bgClass} min-h-screen ${textColor}`} style={getBackgroundStyle()}>
        <PublicMenuHeader 
          restaurant={null} 
          menuItems={[]}
          formatPrice={formatPrice}
          themeSettings={themeSettings}
        />
        <div className="p-4 flex justify-center items-center h-[80vh]">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 ${themeSettings.isLightTheme ? 'border-black' : 'border-white'}`}></div>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !restaurant)) {
    return (
      <div className={`${bgClass} min-h-screen ${textColor}`} style={getBackgroundStyle()}>
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
    <div className={`${bgClass} ${textColor} min-h-screen`} style={getBackgroundStyle()}>
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
