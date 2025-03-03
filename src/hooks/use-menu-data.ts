
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface RestaurantProfile {
  restaurant_name: string | null;
  owner_name: string | null;
  logo_url: string | null;
}

export function useMenuData() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profile, setProfile] = useState<RestaurantProfile>({
    restaurant_name: "",
    owner_name: "",
    logo_url: null
  });
  const [debugInfo, setDebugInfo] = useState({
    userId: null,
    restaurantId: null
  });
  const { toast } = useToast();

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const userId = session.user.id;
    setDebugInfo(prev => ({...prev, userId}));

    const { data, error } = await supabase
      .from('restaurant_profiles')
      .select('restaurant_name, owner_name, logo_url')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data);
    } else {
      console.error('Error loading profile:', error);
    }
  };

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      setDebugInfo(prev => ({...prev, restaurantId: userId}));
      
      console.log("Loading data for user/restaurant ID:", userId);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('restaurant_id', userId);

      if (categoriesError) throw categoriesError;
      console.log(`Found ${categoriesData?.length || 0} categories for restaurant ID ${userId}`);
      setCategories(categoriesData || []);

      // Load menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', userId);

      if (itemsError) throw itemsError;
      console.log(`Found ${itemsData?.length || 0} menu items for restaurant ID ${userId}`);
      setItems(itemsData || []);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadProfile();
  }, []);

  const refreshData = () => {
    loadData();
    setHasUnsavedChanges(true);
  };

  return {
    items,
    setItems,
    categories,
    isLoading,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    profile,
    refreshData,
    debugInfo
  };
}
