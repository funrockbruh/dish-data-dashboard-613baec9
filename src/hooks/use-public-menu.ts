
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

        if (!restaurantName) {
          setError("No restaurant name provided");
          setIsLoading(false);
          return;
        }

        // Clean and format restaurant name for comparison
        const formattedName = restaurantName.replace(/-/g, ' ').toLowerCase().trim();
        
        // Try first with an exact name match
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurant_profiles")
          .select("id, restaurant_name, logo_url");

        if (restaurantError) {
          console.error("Restaurant query error:", restaurantError);
          throw restaurantError;
        }
        
        if (!restaurantData || restaurantData.length === 0) {
          setError("No restaurants found");
          setIsLoading(false);
          return;
        }

        console.log("All restaurants found:", restaurantData);
        
        // First try exact match (case-insensitive)
        let currentRestaurant = restaurantData.find(r => 
          r.restaurant_name && 
          r.restaurant_name.toLowerCase().trim() === formattedName
        );
        
        // If no exact match, try contains (more flexible)
        if (!currentRestaurant) {
          currentRestaurant = restaurantData.find(r => 
            r.restaurant_name && 
            (r.restaurant_name.toLowerCase().includes(formattedName) ||
             formattedName.includes(r.restaurant_name.toLowerCase()))
          );
        }
        
        // If still no match, try with parts of the name
        if (!currentRestaurant && formattedName.includes(" ")) {
          const nameParts = formattedName.split(" ");
          for (const part of nameParts) {
            if (part.length < 3) continue; // Skip very short words
            
            const matchByPart = restaurantData.find(r =>
              r.restaurant_name && r.restaurant_name.toLowerCase().includes(part)
            );
            
            if (matchByPart) {
              currentRestaurant = matchByPart;
              break;
            }
          }
        }
        
        // Try one more attempt - use the first restaurant if it's the only one
        if (!currentRestaurant && restaurantData.length === 1) {
          currentRestaurant = restaurantData[0];
        }
        
        if (!currentRestaurant) {
          setError(`Restaurant "${restaurantName}" not found`);
          setIsLoading(false);
          return;
        }
        
        console.log("Found restaurant:", currentRestaurant);
        setRestaurant(currentRestaurant);
        
        // Load menu data for the selected restaurant
        await loadMenuData(currentRestaurant.id, formattedName);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load menu data");
      } finally {
        setIsLoading(false);
      }
    };

    const loadMenuData = async (restaurantId: string, searchName: string): Promise<boolean> => {
      console.log("Loading menu data for restaurant ID:", restaurantId);
      let debugData = {
        restaurantId,
        categoriesResponse: null,
        itemsResponse: null,
        alternativeSearch: false
      };
      
      try {
        // Fetch categories for this restaurant
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("id, name, image_url")
          .eq("restaurant_id", restaurantId);

        debugData.categoriesResponse = { data: categoriesData, error: categoriesError };
        
        if (categoriesError) {
          console.error("Categories query error:", categoriesError);
        }
        
        console.log("Categories loaded:", categoriesData);
        setCategories(categoriesData || []);

        // Fetch menu items for this restaurant
        const { data: itemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", restaurantId);

        debugData.itemsResponse = { data: itemsData, error: itemsError };
        
        if (itemsError) {
          console.error("Menu items query error:", itemsError);
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
          // If no data found with restaurant ID, try with other restaurants that might match
          debugData.alternativeSearch = true;
          
          // Get all items to find potential matches
          const { data: allItems } = await supabase
            .from("menu_items")
            .select("*");
            
          if (allItems && allItems.length > 0) {
            console.log("Found some menu items in general search:", allItems);
            
            // Find all unique restaurant IDs from items
            const uniqueRestaurantIds = [...new Set(allItems.map(item => item.restaurant_id))];
            console.log("Unique restaurant IDs with items:", uniqueRestaurantIds);
            
            // Get restaurant profiles for these IDs
            if (uniqueRestaurantIds.length > 0) {
              const { data: itemRestaurants } = await supabase
                .from("restaurant_profiles")
                .select("id, restaurant_name")
                .in("id", uniqueRestaurantIds);
                
              console.log("Restaurants with items:", itemRestaurants);
              
              // Find a better restaurant match based on name similarity
              if (itemRestaurants && itemRestaurants.length > 0) {
                const betterMatch = itemRestaurants.find(r => 
                  r.restaurant_name && 
                  (r.restaurant_name.toLowerCase().includes(searchName) ||
                   searchName.includes(r.restaurant_name.toLowerCase()))
                );
                
                if (betterMatch) {
                  console.log("Found better restaurant match:", betterMatch);
                  
                  // Load data for this restaurant instead
                  const { data: betterItems } = await supabase
                    .from("menu_items")
                    .select("*")
                    .eq("restaurant_id", betterMatch.id);
                    
                  if (betterItems && betterItems.length > 0) {
                    console.log("Found items for better match:", betterItems);
                    setMenuItems(betterItems);
                    
                    // Update restaurant info
                    const { data: fullRestaurant } = await supabase
                      .from("restaurant_profiles")
                      .select("id, restaurant_name, logo_url")
                      .eq("id", betterMatch.id)
                      .single();
                      
                    if (fullRestaurant) {
                      setRestaurant(fullRestaurant);
                    }
                    
                    // Get categories for this restaurant
                    const { data: betterCategories } = await supabase
                      .from("menu_categories")
                      .select("id, name, image_url")
                      .eq("restaurant_id", betterMatch.id);
                      
                    if (betterCategories) {
                      setCategories(betterCategories);
                    }
                    
                    // Filter featured items
                    const betterFeatured = betterItems.filter(item => item.is_featured === true);
                    setFeaturedItems(betterFeatured);
                    
                    return true;
                  }
                }
              }
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
