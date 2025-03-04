
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface DebugInfoPanelProps {
  restaurantId: string;
  debugInfo?: any;
}

export const DebugInfoPanel = ({ restaurantId, debugInfo }: DebugInfoPanelProps) => {
  const [allRestaurantData, setAllRestaurantData] = useState<any>(null);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdditionalDebugInfo = async () => {
      try {
        // Get all restaurant profiles for debugging
        const { data: allRestaurants } = await supabase
          .from('restaurant_profiles')
          .select('id, restaurant_name')
          .limit(5);
        
        // Get current user session info
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get current user's restaurant profile
          const { data: userRestaurant } = await supabase
            .from('restaurant_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setCurrentUserData({
            userId: session.user.id,
            email: session.user.email,
            userRestaurant
          });
          
          // Check if there are menu items for the current user
          const { data: userMenuItems } = await supabase
            .from('menu_items')
            .select('id, name')
            .eq('restaurant_id', session.user.id)
            .limit(5);
            
          if (userMenuItems) {
            setCurrentUserData(prev => ({
              ...prev,
              menuItemsCount: userMenuItems.length,
              menuItems: userMenuItems
            }));
          }
        }
        
        setAllRestaurantData(allRestaurants);
      } catch (error) {
        console.error("Error fetching debug info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdditionalDebugInfo();
  }, []);

  if (!debugInfo && !allRestaurantData && !currentUserData) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-700">
      <details className="text-sm">
        <summary className="text-gray-400 cursor-pointer mb-2">Debug Information</summary>
        <div className="pl-3 text-gray-300 space-y-2 text-xs">
          <p>Restaurant ID (from URL): {restaurantId}</p>
          
          {debugInfo && <DebugResponseInfo debugInfo={debugInfo} />}
          
          {isLoading ? (
            <p className="text-blue-400">Loading additional debug info...</p>
          ) : (
            <>
              {currentUserData && <UserDebugInfo currentUserData={currentUserData} restaurantId={restaurantId} />}
              
              {allRestaurantData && allRestaurantData.length > 0 && (
                <RestaurantListDebug allRestaurantData={allRestaurantData} currentUserId={currentUserData?.userId} />
              )}
            </>
          )}
        </div>
      </details>
    </div>
  );
};

const DebugResponseInfo = ({ debugInfo }: { debugInfo: any }) => (
  <>
    <div>
      <p className="font-semibold mt-2">Categories Response:</p>
      <p className="text-gray-400">
        {debugInfo.categoriesResponse?.data ? 
          `Found ${debugInfo.categoriesResponse.data.length} categories` : 
          'No categories found'}
      </p>
    </div>
    
    <div>
      <p className="font-semibold mt-2">Menu Items Response:</p>
      <p className="text-gray-400">
        {debugInfo.itemsResponse?.data ? 
          `Found ${debugInfo.itemsResponse.data.length} menu items` : 
          'No menu items found'}
      </p>
    </div>
    
    {debugInfo.alternativeSearch && (
      <div className="mt-2 text-blue-300">
        <p>Alternative search was attempted</p>
      </div>
    )}
  </>
);

const UserDebugInfo = ({ currentUserData, restaurantId }: { currentUserData: any, restaurantId: string }) => (
  <div className="mt-4 border-t border-gray-700 pt-4">
    <p className="font-semibold text-blue-400">Current User Information:</p>
    <p>User ID: {currentUserData.userId}</p>
    <p>Email: {currentUserData.email}</p>
    
    {currentUserData.userRestaurant && (
      <div className="mt-2">
        <p>User's Restaurant Name: {currentUserData.userRestaurant.restaurant_name}</p>
        <p>User's Restaurant ID: {currentUserData.userRestaurant.id}</p>
      </div>
    )}
    
    {currentUserData.menuItems && (
      <div className="mt-2">
        <p className="font-semibold text-green-400">
          User has {currentUserData.menuItemsCount || 0} menu items in their own restaurant:
        </p>
        <ul className="list-disc list-inside">
          {currentUserData.menuItems.map((item: any) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
        
        <PotentialIssuePanel 
          restaurantId={restaurantId} 
          userId={currentUserData.userId} 
          restaurantName={currentUserData.userRestaurant?.restaurant_name} 
        />
      </div>
    )}
  </div>
);

const PotentialIssuePanel = ({ restaurantId, userId, restaurantName }: { restaurantId: string, userId: string, restaurantName?: string }) => {
  if (restaurantId === userId) return null;
  
  return (
    <div className="mt-2 p-2 bg-yellow-900/30 rounded border border-yellow-600/50">
      <p className="text-yellow-400 font-bold">Potential Issue:</p>
      <p>The restaurant ID from the URL ({restaurantId}) doesn't match your user ID ({userId}).</p>
      <p>Menu items are likely associated with your user ID, not the restaurant ID in the URL.</p>
      <p className="mt-2">To fix this issue:</p>
      <ul className="list-disc list-inside text-green-300">
        <li>Try accessing your menu at: <strong>/menu/{restaurantName?.toLowerCase().replace(/\s+/g, '-')}</strong></li>
        <li>Or add menu items to restaurant ID: {restaurantId}</li>
      </ul>
    </div>
  );
};

const RestaurantListDebug = ({ allRestaurantData, currentUserId }: { allRestaurantData: any[], currentUserId?: string }) => (
  <div className="mt-4 border-t border-gray-700 pt-4">
    <p className="font-semibold text-blue-400">Available Restaurants (First 5):</p>
    <ul className="list-disc list-inside">
      {allRestaurantData.map((restaurant: any) => (
        <li key={restaurant.id}>
          {restaurant.restaurant_name} (ID: {restaurant.id})
          {currentUserId === restaurant.id && (
            <span className="text-green-400 ml-2">(Your Restaurant)</span>
          )}
        </li>
      ))}
    </ul>
  </div>
);
