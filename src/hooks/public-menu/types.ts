
export interface Restaurant {
  id: string;
  restaurant_name: string;
  logo_url: string | null;
}

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured: boolean;
}

export interface PublicMenuState {
  restaurant: Restaurant | null;
  categories: Category[];
  menuItems: MenuItem[];
  featuredItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  debugInfo: any;
}

export interface RestaurantSearchParams {
  restaurantName: string | undefined;
  formattedName: string;
}
