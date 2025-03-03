
import { useParams } from "react-router-dom";
import { usePublicMenu } from "@/hooks/use-public-menu";
import { PublicMenuHeader } from "@/components/public-menu/PublicMenuHeader";
import { FeaturedSection } from "@/components/public-menu/FeaturedSection";
import { CategoriesSection } from "@/components/public-menu/CategoriesSection";
import { MenuItemsSection } from "@/components/public-menu/MenuItemsSection";
import { EmptyMenuState } from "@/components/menu/EmptyMenuState";

export const PublicMenu = () => {
  const { restaurantName } = useParams();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  const noMenuItems = menuItems.length === 0;
  const noCategories = categories.length === 0;
  const noData = noMenuItems && noCategories;

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicMenuHeader 
        restaurantName={restaurant?.restaurant_name} 
        logoUrl={restaurant?.logo_url} 
      />

      <main className="p-4 space-y-6">
        {/* Empty State with Debug Info */}
        {noData && (
          <EmptyMenuState 
            restaurantId={restaurant?.id || ''}
            restaurantName={restaurant?.restaurant_name || ''}
            debugInfo={debugInfo}
          />
        )}

        {/* Featured Section */}
        <FeaturedSection 
          featuredItems={featuredItems} 
          formatPrice={formatPrice} 
        />

        {/* Categories */}
        <CategoriesSection categories={categories} />

        {/* Menu Items Grid */}
        <MenuItemsSection 
          menuItems={menuItems} 
          formatPrice={formatPrice} 
        />
      </main>
    </div>
  );
};
