
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface RestaurantProfile {
  restaurant_name: string | null;
  owner_name: string | null;
  logo_url: string | null;
  subdomain: string | null;
}

export function useRestaurantProfile() {
  const [profile, setProfile] = useState<RestaurantProfile>({
    restaurant_name: "",
    owner_name: "",
    logo_url: null,
    subdomain: null
  });

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('restaurant_profiles')
      .select('restaurant_name, owner_name, logo_url, subdomain')
      .eq('id', session.user.id)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return { profile };
}
