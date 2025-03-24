
export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured: boolean;
  restaurant_id: string;
}

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

export interface Restaurant {
  id: string;
  restaurant_name: string;
  logo_url: string | null;
  owner_name: string | null;
  owner_number: string | null;
  about: string | null;
}
