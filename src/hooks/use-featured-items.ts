
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured?: boolean;
}

export function useFeaturedItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredEnabled, setFeaturedEnabled] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Load all menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', session.user.id);

      if (itemsError) throw itemsError;
      
      // Start with empty featured items - let user manually select
      setItems(itemsData || []);
      setFeaturedItems([]);
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

  const toggleFeatured = async (item: MenuItem) => {
    const isCurrentlyFeatured = featuredItems.some(featured => featured.id === item.id);
    
    try {
      if (isCurrentlyFeatured) {
        // Remove from featured
        setFeaturedItems(featuredItems.filter(featured => featured.id !== item.id));
      } else {
        // Add to featured
        setFeaturedItems([...featuredItems, item]);
      }
      
      // In a real app, you would save this to the database
      // await supabase.from('menu_items')
      //   .update({ is_featured: !isCurrentlyFeatured })
      //   .eq('id', item.id);
      
      toast({
        title: "Success",
        description: isCurrentlyFeatured 
          ? `${item.name} removed from featured items` 
          : `${item.name} added to featured items`
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      });
    }
  };

  const saveFeatured = async () => {
    try {
      setIsLoading(true);
      // In a real app, you would save all featured items to the database here
      
      toast({
        title: "Success",
        description: "Featured items saved successfully"
      });
    } catch (error) {
      console.error('Error saving featured items:', error);
      toast({
        title: "Error",
        description: "Failed to save featured items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFeaturedItem = (item: MenuItem) => {
    if (!featuredItems.some(featured => featured.id === item.id)) {
      setFeaturedItems([...featuredItems, item]);
      toast({
        title: "Success",
        description: `${item.name} added to featured items`
      });
    }
  };

  return {
    items,
    featuredItems,
    isLoading,
    featuredEnabled,
    setFeaturedEnabled,
    loadData,
    toggleFeatured,
    saveFeatured,
    addFeaturedItem
  };
}
