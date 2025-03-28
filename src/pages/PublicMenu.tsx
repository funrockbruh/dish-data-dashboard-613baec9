
import { useParams } from "react-router-dom";
import { usePublicMenu } from "@/hooks/public-menu";
import { PublicMenuHeader } from "@/components/public-menu/PublicMenuHeader";
import { FeaturedSection } from "@/components/public-menu/FeaturedSection";
import { CategoriesSection } from "@/components/public-menu/CategoriesSection";
import { MenuItemsSection } from "@/components/public-menu/MenuItemsSection";
import { EmptyMenuState } from "@/components/menu/EmptyMenuState";
import { SubscriptionExpiryWarning } from "@/components/public-menu/SubscriptionExpiryWarning";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

const PublicMenu = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const { 
    restaurant, 
    categories, 
    menuItems, 
    featuredItems, 
    isLoading, 
    error, 
    debugInfo,
    formatPrice 
  } = usePublicMenu(subdomain);
  
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!restaurant?.id) return;
      
      try {
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurant_profiles")
          .select("id")
          .eq("id", restaurant.id)
          .single();
          
        if (restaurantError || !restaurantData) return;
        
        const { data: subscriptions, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("end_date, status")
          .eq("user_id", restaurantData.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (subscriptionError || !subscriptions || subscriptions.length === 0) {
          setShowExpiryWarning(true);
          return;
        }
        
        const subscription = subscriptions[0];
        const endDate = new Date(subscription.end_date);
        const now = new Date();
        
        if (endDate < now) {
          setShowExpiryWarning(true);
          setSubscriptionExpired(true);
        }
      } catch (err) {
        console.error("Error checking subscription status:", err);
      }
    };
    
    checkSubscriptionStatus();
  }, [restaurant]);

  useEffect(() => {
    console.log("Public Menu State:", {
      restaurant,
      menuItems: menuItems.length,
      categories: categories.length,
      featuredItems: featuredItems.length,
      error,
      showExpiryWarning,
      subscriptionExpired
    });
    
    if (menuItems.length > 0) {
      console.log("Sample menu item:", menuItems[0]);
    }
    
    if (debugInfo) {
      console.log("Debug info:", debugInfo);
    }
  }, [restaurant, menuItems, categories, featuredItems, error, debugInfo, showExpiryWarning]);

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Skeleton className="h-8 w-24 bg-gray-800" />
          <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
        </div>
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <Skeleton className="w-full h-48 rounded-lg bg-gray-800" />
          </div>
          
          <div className="mb-4 flex overflow-x-auto gap-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="flex-none w-24 h-24 rounded-lg bg-gray-800" />
            ))}
          </div>
          
          <div className="mb-8">
            <Skeleton className="w-1/2 h-8 mb-4 bg-gray-800" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="w-full h-32 rounded-lg mb-2 bg-gray-800" />
                  <Skeleton className="w-3/4 h-4 mb-1 bg-gray-800" />
                  <Skeleton className="w-1/2 h-3 bg-gray-800" />
                </div>
              ))}
            </div>
          </div>
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
            restaurantName={subdomain || ''} 
            debugInfo={debugInfo}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      {showExpiryWarning && restaurant && (
        <SubscriptionExpiryWarning 
          restaurantName={restaurant.restaurant_name || subdomain || 'Restaurant'} 
          expiryDate={new Date().toISOString()} 
        />
      )}
      
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
