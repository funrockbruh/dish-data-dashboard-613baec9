
import { supabase } from "@/lib/supabase";
import { Restaurant, RestaurantSearchParams } from "./types";

export const findRestaurantByName = async (
  searchParams: RestaurantSearchParams
): Promise<Restaurant | null> => {
  const { restaurantName, formattedName } = searchParams;
  console.log("Searching for restaurant:", restaurantName);

  if (!restaurantName) {
    return null;
  }

  // Fetch all restaurant profiles
  const { data: restaurantData, error: restaurantError } = await supabase
    .from("restaurant_profiles")
    .select("id, restaurant_name, logo_url");

  if (restaurantError) {
    console.error("Restaurant query error:", restaurantError);
    throw restaurantError;
  }

  if (!restaurantData || restaurantData.length === 0) {
    return null;
  }

  console.log("All restaurants found:", restaurantData);

  // First try exact match (case-insensitive)
  let currentRestaurant = restaurantData.find(
    (r) =>
      r.restaurant_name &&
      r.restaurant_name.toLowerCase().trim() === formattedName
  );

  // If no exact match, try contains (more flexible)
  if (!currentRestaurant) {
    currentRestaurant = restaurantData.find(
      (r) =>
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

      const matchByPart = restaurantData.find(
        (r) => r.restaurant_name && r.restaurant_name.toLowerCase().includes(part)
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

  return currentRestaurant || null;
};
