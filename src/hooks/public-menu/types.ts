
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
  // Add social media fields
  social_whatsapp?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
  social_email?: string;
}
