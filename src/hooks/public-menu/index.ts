
import { useState, useEffect } from "react";
import { findRestaurantByName } from "./restaurant-search";
import { loadMenuData } from "./menu-data";
import { formatPrice } from "./format-utils";
import { Category, MenuItem, PublicMenuState, Restaurant } from "./types";

export { formatPrice };
export type { Restaurant, Category, MenuItem };

export function usePublicMenu(subdomain: string | undefined) {
  const [state, setState] = useState<PublicMenuState>({
    restaurant: null,
    categories: [],
    menuItems: [],
    featuredItems: [],
    isLoading: true,
    error: null,
    debugInfo: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        if (!subdomain) {
          setState((prev) => ({
            ...prev,
            error: "No subdomain provided",
            isLoading: false,
          }));
          return;
        }

        // Format the subdomain for comparison (removing hyphens)
        const formattedName = subdomain.replace(/-/g, " ").toLowerCase().trim();
        
        // Find restaurant by subdomain first, then by name as fallback
        const currentRestaurant = await findRestaurantByName({
          restaurantName: subdomain,
          formattedName,
        });

        if (!currentRestaurant) {
          setState((prev) => ({
            ...prev,
            error: `Restaurant with subdomain "${subdomain}" not found`,
            isLoading: false,
          }));
          return;
        }

        console.log("Found restaurant:", currentRestaurant);
        
        // Load menu data for the selected restaurant
        const menuData = await loadMenuData(currentRestaurant.id, formattedName);
        
        setState({
          restaurant: currentRestaurant,
          categories: menuData.categories,
          menuItems: menuData.menuItems,
          featuredItems: menuData.featuredItems,
          isLoading: false,
          error: null,
          debugInfo: menuData.debugInfo,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to load menu data",
          isLoading: false,
        }));
      }
    };

    if (subdomain) {
      fetchData();
    }
  }, [subdomain]);

  return {
    ...state,
    formatPrice,
  };
}
