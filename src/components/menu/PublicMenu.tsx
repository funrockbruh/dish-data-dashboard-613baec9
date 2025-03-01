
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured: boolean | null;
};

type Category = {
  id: string;
  name: string;
  image_url: string | null;
};

type Restaurant = {
  restaurant_name: string | null;
  owner_name: string | null;
  logo_url: string | null;
};

export const PublicMenu = () => {
  const { restaurantName } = useParams<{ restaurantName: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        
        // Step 1: Find the restaurant by name
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurant_profiles')
          .select('*')
          .ilike('restaurant_name', restaurantName || '')
          .single();
        
        if (restaurantError || !restaurantData) {
          setError("Restaurant not found");
          setLoading(false);
          return;
        }
        
        setRestaurant(restaurantData);
        
        // Step 2: Get featured items
        const { data: featuredData, error: featuredError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantData.id)
          .eq('is_featured', true);
          
        if (featuredError) throw featuredError;
        setFeaturedItems(featuredData || []);
        
        // Step 3: Get categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('restaurant_id', restaurantData.id);
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        // Step 4: Get all menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurantData.id);
          
        if (itemsError) throw itemsError;
        setMenuItems(itemsData || []);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [restaurantName]);
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-white">Loading menu...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <p className="text-white text-xl">{error}</p>
      <p className="text-gray-400 mt-2">Please check the URL and try again.</p>
    </div>
  );

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price / 100) + " L.L.";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with logo and search */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="w-10 h-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        
        <div className="flex items-center justify-center">
          {restaurant?.logo_url && (
            <img 
              src={restaurant.logo_url} 
              alt={restaurant?.restaurant_name || "Restaurant"} 
              className="h-16 w-16 rounded-full"
            />
          )}
        </div>
        
        <div className="w-10 h-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </div>
      </header>
      
      {/* Featured section */}
      {featuredItems.length > 0 && (
        <section className="relative">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={featuredItems[0].image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
              alt={featuredItems[0].name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
            <div className="absolute top-4 left-4 bg-black/50 px-4 py-1 uppercase tracking-widest text-white font-bold">
              Featured
            </div>
            <h2 className="absolute bottom-6 left-0 w-full text-center text-4xl font-bold text-white">
              {featuredItems[0].name}
            </h2>
          </div>
        </section>
      )}
      
      {/* Categories carousel */}
      {categories.length > 0 && (
        <section className="py-4 px-2">
          <Carousel>
            <CarouselContent>
              {categories.map((category) => (
                <CarouselItem key={category.id} className="basis-1/4 md:basis-1/6">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                      <img 
                        src={category.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="mt-2 text-sm text-center">{category.name}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>
      )}
      
      {/* Menu items grid */}
      <section className="p-4 grid grid-cols-2 gap-4">
        {menuItems.slice(0, 4).map((item) => (
          <Card key={item.id} className="relative overflow-hidden bg-black border-0">
            <img 
              src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} 
              alt={item.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-2">
              <h3 className="text-lg font-semibold truncate">{item.name}</h3>
              <p className="text-gray-400">{formatPrice(item.price)}</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};
