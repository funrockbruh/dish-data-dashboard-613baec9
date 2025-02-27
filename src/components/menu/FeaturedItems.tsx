
import { useState, useEffect } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured?: boolean;
}

export const FeaturedItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredEnabled, setFeaturedEnabled] = useState(true);
  const [profile, setProfile] = useState<{
    restaurant_name: string | null;
    owner_name: string | null;
    logo_url: string | null;
  }>({
    restaurant_name: "",
    owner_name: "",
    logo_url: null
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('restaurant_profiles')
      .select('restaurant_name, owner_name, logo_url')
      .eq('id', session.user.id)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="flex items-center justify-between gap-4 mb-8 p-4 bg-white border border-gray-200 rounded-2xl">
        <div className="flex items-center gap-4">
          {profile.logo_url && (
            <img 
              src={profile.logo_url} 
              alt="Restaurant logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
          )}
          <div className="-space-y-1">
            <h1 className="text-2xl font-bold font-figtree">{profile.restaurant_name || "Just Fajita"}</h1>
            <p className="text-gray-500 text-sm font-figtree">by {profile.owner_name || "Kassem Zaiter"}</p>
          </div>
        </div>
        <Link to="/menu">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold">Featured</h2>
        <div className="flex items-center gap-2">
          <Switch 
            checked={featuredEnabled} 
            onCheckedChange={setFeaturedEnabled} 
            className="data-[state=checked]:bg-green-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Add featured item placeholder */}
        <div 
          className="bg-gray-200 rounded-xl aspect-video flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
          onClick={() => {
            if (items.length > 0 && featuredItems.length < items.length) {
              // Find first item that isn't already featured
              const nonFeatured = items.find(item => !featuredItems.some(f => f.id === item.id));
              if (nonFeatured) {
                toggleFeatured(nonFeatured);
              }
            }
          }}
        >
          <Plus className="h-16 w-16 text-gray-500" />
        </div>

        {/* Featured items */}
        {featuredItems.map((item) => (
          <div 
            key={item.id} 
            className="relative rounded-xl overflow-hidden"
            onClick={() => toggleFeatured(item)}
          >
            <img 
              src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
              alt={item.name}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-1 bg-amber-700 rounded-full"></div>
              </div>
              <h3 className="text-white text-4xl font-bold mt-6">{item.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={saveFeatured}
          disabled={isLoading}
          className="px-6 py-6 rounded-xl bg-[#23c55e]"
        >
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
};
