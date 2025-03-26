
import { supabase } from "@/lib/supabase";
import { Restaurant, RestaurantSearchParams } from "./types";

export const findRestaurantByName = async (
  searchParams: RestaurantSearchParams
): Promise<Restaurant | null> => {
  const { restaurantName, formattedName } = searchParams;
  console.log("Searching for restaurant by subdomain:", restaurantName);

  if (!restaurantName) {
    return null;
  }

  // First try to find by subdomain (exact match)
  const { data: subdomainMatch, error: subdomainError } = await supabase
    .from("restaurant_profiles")
    .select("id, restaurant_name, logo_url, owner_name, owner_number, about, social_whatsapp, social_instagram, social_facebook, social_tiktok, social_email, subdomain")
    .eq("subdomain", restaurantName)
    .maybeSingle();

  if (subdomainMatch) {
    console.log("Found restaurant by subdomain:", subdomainMatch);
    return subdomainMatch;
  }

  // If no match by subdomain, fetch all restaurant profiles
  const { data: restaurantData, error: restaurantError } = await supabase
    .from("restaurant_profiles")
    .select("id, restaurant_name, logo_url, owner_name, owner_number, about, social_whatsapp, social_instagram, social_facebook, social_tiktok, social_email, subdomain");

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

  // Log the found restaurant including social media data to help with debugging
  if (currentRestaurant) {
    console.log("Found restaurant with social media:", {
      name: currentRestaurant.restaurant_name,
      subdomain: currentRestaurant.subdomain,
      social_whatsapp: currentRestaurant.social_whatsapp,
      social_instagram: currentRestaurant.social_instagram,
      social_facebook: currentRestaurant.social_facebook,
      social_tiktok: currentRestaurant.social_tiktok
    });
  }

  return currentRestaurant || null;
};
