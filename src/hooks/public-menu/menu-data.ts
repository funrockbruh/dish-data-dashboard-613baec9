
import { supabase } from "@/lib/supabase";
import { Category, MenuItem } from "./types";

export interface MenuDataResult {
  categories: Category[];
  menuItems: MenuItem[];
  featuredItems: MenuItem[];
  debugInfo: any;
}

export const loadMenuData = async (
  restaurantId: string,
  searchName: string
): Promise<MenuDataResult> => {
  console.log("Loading menu data for restaurant ID:", restaurantId);
  let debugData = {
    restaurantId,
    categoriesResponse: null,
    itemsResponse: null,
    alternativeSearch: false,
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

    // Filter featured items
    const featured =
      itemsData?.filter((item) => item.is_featured === true) || [];
    console.log("Featured items:", featured);

    // Return data found
    const foundData =
      (categoriesData && categoriesData.length > 0) ||
      (itemsData && itemsData.length > 0);

    if (!foundData) {
      // If no data found with restaurant ID, try with other restaurants that might match
      const alternativeResult = await tryAlternativeSearch(searchName, debugData);
      if (alternativeResult) {
        return alternativeResult;
      }
    }

    return {
      categories: categoriesData || [],
      menuItems: itemsData || [],
      featuredItems: featured,
      debugInfo: debugData,
    };
  } catch (error) {
    console.error("Error loading menu data:", error);
    return {
      categories: [],
      menuItems: [],
      featuredItems: [],
      debugInfo: debugData,
    };
  }
};

const tryAlternativeSearch = async (
  searchName: string,
  debugData: any
): Promise<MenuDataResult | null> => {
  debugData.alternativeSearch = true;

  // Get all items to find potential matches
  const { data: allItems } = await supabase.from("menu_items").select("*");

  if (allItems && allItems.length > 0) {
    console.log("Found some menu items in general search:", allItems);

    // Find all unique restaurant IDs from items
    const uniqueRestaurantIds = [...new Set(allItems.map((item) => item.restaurant_id))];
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
        const betterMatch = itemRestaurants.find(
          (r) =>
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

            // Get categories for this restaurant
            const { data: betterCategories } = await supabase
              .from("menu_categories")
              .select("id, name, image_url")
              .eq("restaurant_id", betterMatch.id);

            // Filter featured items
            const betterFeatured = betterItems.filter(
              (item) => item.is_featured === true
            );

            return {
              categories: betterCategories || [],
              menuItems: betterItems,
              featuredItems: betterFeatured,
              debugInfo: debugData,
            };
          }
        }
      }
    }
  }

  return null;
};
