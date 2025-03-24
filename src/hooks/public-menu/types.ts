
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  items: MenuItem[];
}

export interface Restaurant {
  id?: string;
  restaurant_name?: string;
  owner_name?: string;
  logo_url?: string;
  owner_email?: string;
  owner_number?: string;
  about?: string;
  // Social media fields
  social_whatsapp?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
  social_email?: string;
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
