
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Restaurant {
  id: string;
  restaurant_name: string;
  logo_url: string | null;
}

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured: boolean;
}

export function usePublicMenu(restaurantName: string | undefined) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Searching for restaurant:", restaurantName);

        // Improved restaurant search - more flexible matching
        const formattedName = restaurantName?.replace(/-/g, ' ');
        
        let { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurant_profiles")
          .select("id, restaurant_name, logo_url")
          .ilike("restaurant_name", `%${formattedName}%`)
          .limit(10); // Increased limit to find more potential matches

        console.log("Restaurant search results:", restaurantData);

        if (restaurantError) {
          console.error("Restaurant query error:", restaurantError);
          throw restaurantError;
        }
        
        let currentRestaurant = null;
        
        if (!restaurantData || restaurantData.length === 0) {
          console.log("No restaurant found with initial search, trying alternative search");
          // Try a more flexible search if the first one failed
          const { data: altRestaurantData, error: altError } = await supabase
            .from("restaurant_profiles")
            .select("id, restaurant_name, logo_url");
            
          console.log("All restaurants:", altRestaurantData);
          
          if (!altError && altRestaurantData && altRestaurantData.length > 0) {
            // Try to find a match manually with more flexible criteria
            currentRestaurant = altRestaurantData.find(r => 
              r.restaurant_name && 
              (r.restaurant_name.toLowerCase().includes(formattedName?.toLowerCase() || '') ||
               formattedName?.toLowerCase().includes(r.restaurant_name.toLowerCase()))
            );
          }
          
          if (!currentRestaurant) {
            setError("Restaurant not found");
            setIsLoading(false);
            return;
          }
        } else {
          // Find the best match from the initial search
          // First try exact match (ignoring case)
          currentRestaurant = restaurantData.find(r => 
            r.restaurant_name && r.restaurant_name.toLowerCase() === formattedName?.toLowerCase()
          );
          
          // If no exact match, take the first result
          if (!currentRestaurant) {
            currentRestaurant = restaurantData[0];
          }
        }
        
        console.log("Found restaurant:", currentRestaurant);
        setRestaurant(currentRestaurant);
        
        // Try to load menu items for this restaurant ID - pass formattedName as parameter
        const foundItems = await loadMenuData(currentRestaurant.id, formattedName);
        
        // If no items found and we have multiple results, try other restaurants from search
        if (!foundItems && restaurantData && restaurantData.length > 1) {
          console.log("No items found for first restaurant, trying alternatives");
          
          for (const altRestaurant of restaurantData) {
            if (altRestaurant.id === currentRestaurant.id) continue;
            
            console.log("Trying alternative restaurant:", altRestaurant);
            const hasItems = await loadMenuData(altRestaurant.id, formattedName);
            
            if (hasItems) {
              console.log("Found items in alternative restaurant:", altRestaurant);
              setRestaurant(altRestaurant);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load menu data");
      } finally {
        setIsLoading(false);
      }
    };

    const loadMenuData = async (restaurantId: string, formattedName: string | undefined): Promise<boolean> => {
      console.log("Loading menu data for restaurant ID:", restaurantId);
      let debugData = {
        restaurantId,
        categoriesResponse: null,
        itemsResponse: null,
        alternativeSearch: false
      };
      
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("id, name, image_url")
          .eq("restaurant_id", restaurantId);

        debugData.categoriesResponse = { data: categoriesData, error: categoriesError };
        
        if (categoriesError) {
          console.error("Categories query error:", categoriesError);
          throw categoriesError;
        }
        
        console.log("Categories loaded:", categoriesData);
        setCategories(categoriesData || []);

        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", restaurantId);

        debugData.itemsResponse = { data: itemsData, error: itemsError };
        
        if (itemsError) {
          console.error("Menu items query error:", itemsError);
          throw itemsError;
        }
        
        console.log("Menu items loaded:", itemsData);
        setMenuItems(itemsData || []);
        
        // Filter featured items
        const featured = itemsData?.filter(item => item.is_featured === true) || [];
        console.log("Featured items:", featured);
        setFeaturedItems(featured);
        
        // Return true if we found either categories or menu items
        const foundData = (categoriesData && categoriesData.length > 0) || 
                         (itemsData && itemsData.length > 0);
                         
        if (!foundData) {
          // If no data found with restaurant ID, try with the restaurant name as a last resort
          debugData.alternativeSearch = true;
          
          // We don't need to check authentication for public menu
          // Public menu should be accessible without login

          // Try a more generic search instead
          const { data: allItems } = await supabase
            .from("menu_items")
            .select("*")
            .limit(50);
            
          if (allItems && allItems.length > 0) {
            console.log("Found some menu items in general search:", allItems);
            
            // Try to match by restaurant name if we have some items
            const matchingItems = allItems.filter(item => {
              // Try to find items that might be related to this restaurant
              return item.name?.toLowerCase().includes(formattedName?.toLowerCase() || '') ||
                     (item.description && item.description.toLowerCase().includes(formattedName?.toLowerCase() || ''));
            });
            
            if (matchingItems.length > 0) {
              console.log("Found potentially matching items:", matchingItems);
              setMenuItems(matchingItems);
              
              // Extract category IDs from these items
              const categoryIds = [...new Set(matchingItems.map(item => item.category_id))].filter(Boolean);
              
              if (categoryIds.length > 0) {
                // Fetch these categories
                const { data: relatedCategories } = await supabase
                  .from("menu_categories")
                  .select("id, name, image_url")
                  .in("id", categoryIds);
                  
                if (relatedCategories) {
                  console.log("Found related categories:", relatedCategories);
                  setCategories(relatedCategories);
                }
              }
              
              // Filter featured items
              const userFeatured = matchingItems.filter(item => item.is_featured === true) || [];
              setFeaturedItems(userFeatured);
              
              return true;
            }
          }
        }
        
        return foundData;
      } catch (error) {
        console.error("Error loading menu data:", error);
        return false;
      } finally {
        setDebugInfo(debugData);
      }
    };

    if (restaurantName) {
      fetchData();
    }
  }, [restaurantName]);

  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price / 100);
  };

  return {
    restaurant,
    categories,
    menuItems,
    featuredItems,
    isLoading,
    error,
    debugInfo,
    formatPrice
  };
}
