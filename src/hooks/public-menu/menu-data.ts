
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem, Category, Restaurant } from './types';

export function usePublicMenu(restaurantSlug: string | undefined) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantSlug) {
      setError('Restaurant slug is required');
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        // Fetch restaurant profile
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurant_profiles')
          .select('id, restaurant_name, owner_name, logo_url, owner_email, owner_number, about, social_whatsapp, social_instagram, social_facebook, social_tiktok, social_email')
          .eq('id', restaurantSlug)
          .single();

        if (restaurantError) {
          throw restaurantError;
        }

        if (restaurantData) {
          setRestaurant(restaurantData);
        }

        // Fetch menu categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('id, name, image_url')
          .eq('restaurant_id', restaurantSlug)
          .order('name');

        if (categoriesError) {
          throw categoriesError;
        }

        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, category_id, image_url, is_featured')
          .eq('restaurant_id', restaurantSlug)
          .order('name');

        if (itemsError) {
          throw itemsError;
        }

        // Process featured items
        const featured = itemsData.filter(item => item.is_featured);
        setFeaturedItems(featured);

        // Process categories with items
        const categoriesWithItems = categoriesData.map((category: any) => ({
          ...category,
          items: itemsData.filter((item: any) => item.category_id === category.id)
        }));

        setCategories(categoriesWithItems);
        setMenuItems(itemsData);
      } catch (err: any) {
        console.error('Error fetching menu:', err);
        setError(err.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantSlug]);

  return { restaurant, categories, menuItems, featuredItems, loading, error };
}

// Add the loadMenuData function that is imported in index.ts
export async function loadMenuData(restaurantId: string, restaurantName: string) {
  try {
    // Fetch menu categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('id, name, image_url')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (categoriesError) {
      throw categoriesError;
    }

    // Fetch menu items
    const { data: itemsData, error: itemsError } = await supabase
      .from('menu_items')
      .select('id, name, description, price, category_id, image_url, is_featured')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (itemsError) {
      throw itemsError;
    }

    // Process featured items
    const featuredItems = itemsData.filter(item => item.is_featured);

    // Process categories with items
    const categoriesWithItems = categoriesData.map((category: any) => ({
      ...category,
      items: itemsData.filter((item: any) => item.category_id === category.id)
    }));

    return {
      categories: categoriesWithItems,
      menuItems: itemsData,
      featuredItems,
      debugInfo: {
        restaurantId,
        restaurantName,
        categoriesCount: categoriesData.length,
        itemsCount: itemsData.length
      }
    };
  } catch (err: any) {
    console.error('Error loading menu data:', err);
    return {
      categories: [],
      menuItems: [],
      featuredItems: [],
      debugInfo: {
        error: err.message,
        restaurantId,
        restaurantName
      }
    };
  }
}
