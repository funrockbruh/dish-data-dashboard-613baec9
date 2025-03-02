
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  Carousel,
  CarouselContent,
  CarouselItem 
} from "@/components/ui/carousel";

interface Restaurant {
  id: string;
  restaurant_name: string;
  logo_url: string | null;
}

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured: boolean;
}

export const PublicMenu = () => {
  const { restaurantName } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Find restaurant by name
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurant_profiles")
          .select("id, restaurant_name, logo_url")
          .ilike("restaurant_name", `%${restaurantName}%`)
          .limit(1);

        if (restaurantError) throw restaurantError;
        if (!restaurantData || restaurantData.length === 0) {
          setError("Restaurant not found");
          setIsLoading(false);
          return;
        }

        const currentRestaurant = restaurantData[0];
        setRestaurant(currentRestaurant);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("id, name, image_url")
          .eq("restaurant_id", currentRestaurant.id)
          .order("name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch menu items
        const { data: itemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("restaurant_id", currentRestaurant.id);

        if (itemsError) throw itemsError;
        setMenuItems(itemsData || []);
        
        // Filter featured items
        const featured = itemsData?.filter(item => item.is_featured) || [];
        setFeaturedItems(featured);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load menu data");
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantName) {
      fetchData();
    }
  }, [restaurantName]);

  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button className="p-2 rounded-full">
            <Search className="h-8 w-8 text-white" />
          </button>
          
          {restaurant?.logo_url && (
            <div className="flex-1 flex justify-center">
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.restaurant_name} 
                className="h-16 w-16 rounded-full"
              />
            </div>
          )}
          
          <button className="p-2 rounded-full">
            <Menu className="h-8 w-8 text-white" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Featured Section */}
        {featuredItems.length > 0 && (
          <section>
            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute top-4 left-4 z-10">
                <h2 className="text-lg font-bold tracking-wider uppercase bg-black bg-opacity-60 px-2 py-1">
                  FEATURED
                </h2>
              </div>
              
              <Carousel>
                <CarouselContent>
                  {featuredItems.map((item) => (
                    <CarouselItem key={`featured-${item.id}`}>
                      <div className="relative">
                        <img 
                          src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                          alt={item.name}
                          className="w-full aspect-video object-cover rounded-xl"
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
                          <h3 className="text-3xl font-bold text-white">{item.name}</h3>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="overflow-x-auto">
            <div className="flex space-x-4 py-2">
              {categories.map((category) => (
                <div key={category.id} className="flex-shrink-0 w-32 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <img
                      src={category.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                      alt={category.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Menu Items Grid */}
        <section className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                  alt={item.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="p-2 space-y-1">
                  <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                  <p className="text-gray-400 text-sm truncate">{formatPrice(item.price)} L.L.</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
