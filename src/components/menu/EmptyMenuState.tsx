
import { Info, PlusCircle, ArrowRight, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface EmptyMenuStateProps {
  restaurantId: string;
  restaurantName: string;
  debugInfo?: any;
}

export const EmptyMenuState = ({ restaurantId, restaurantName, debugInfo }: EmptyMenuStateProps) => {
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

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gray-800 rounded-lg mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2 mb-3">
            <Info className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <h3 className="text-yellow-400 font-bold">No Menu Available</h3>
          </div>
          <p className="text-gray-200">
            {restaurantName} hasn't added any menu items or categories yet.
          </p>
          
          {(debugInfo || allRestaurantData || currentUserData) && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <details className="text-sm">
                <summary className="text-gray-400 cursor-pointer mb-2">Debug Information</summary>
                <div className="pl-3 text-gray-300 space-y-2 text-xs">
                  <p>Restaurant ID (from URL): {restaurantId}</p>
                  
                  {debugInfo && (
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
                    </>
                  )}
                  
                  {isLoading ? (
                    <p className="text-blue-400">Loading additional debug info...</p>
                  ) : (
                    <>
                      {currentUserData && (
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
                              
                              <div className="mt-2 p-2 bg-yellow-900/30 rounded border border-yellow-600/50">
                                <p className="text-yellow-400 font-bold">Potential Issue:</p>
                                <p>The restaurant ID from the URL ({restaurantId}) doesn't match your user ID ({currentUserData.userId}).</p>
                                <p>Menu items are likely associated with your user ID, not the restaurant ID in the URL.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {allRestaurantData && allRestaurantData.length > 0 && (
                        <div className="mt-4 border-t border-gray-700 pt-4">
                          <p className="font-semibold text-blue-400">Available Restaurants (First 5):</p>
                          <ul className="list-disc list-inside">
                            {allRestaurantData.map((restaurant: any) => (
                              <li key={restaurant.id}>
                                {restaurant.restaurant_name} (ID: {restaurant.id})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex flex-col items-center justify-center py-8">
        <Card className="bg-gray-900 border border-gray-800 w-full max-w-md overflow-hidden">
          <div className="p-6 text-center">
            <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Ready to create your menu?</h3>
            <p className="text-gray-400 mb-6">
              If you own this restaurant, log in to add your menu items, categories and featured dishes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800" asChild>
                <Link to="/">
                  Return to Homepage <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button className="bg-green-600 hover:bg-green-500" asChild>
                <Link to="/menu">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Menu
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
