
import { useState, useEffect } from "react";
import { Restaurant, findRestaurantByName } from "./restaurant-search";
import { loadMenuData } from "./menu-data";
import { formatPrice } from "./format-utils";
import { Category, MenuItem, PublicMenuState } from "./types";

export { formatPrice };
export type { Restaurant, Category, MenuItem };

export function usePublicMenu(restaurantName: string | undefined) {
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

        if (!restaurantName) {
          setState((prev) => ({
            ...prev,
            error: "No restaurant name provided",
            isLoading: false,
          }));
          return;
        }

        // Clean and format restaurant name for comparison
        const formattedName = restaurantName.replace(/-/g, " ").toLowerCase().trim();
        
        // Find restaurant by name
        const currentRestaurant = await findRestaurantByName({
          restaurantName,
          formattedName,
        });

        if (!currentRestaurant) {
          setState((prev) => ({
            ...prev,
            error: `Restaurant "${restaurantName}" not found`,
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

    if (restaurantName) {
      fetchData();
    }
  }, [restaurantName]);

  return {
    ...state,
    formatPrice,
  };
}
