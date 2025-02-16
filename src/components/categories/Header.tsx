
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const [profile, setProfile] = useState<{
    restaurant_name: string | null;
    owner_name: string | null;
  }>({
    restaurant_name: "",
    owner_name: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('restaurant_profiles')
        .select('restaurant_name, owner_name')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        setProfile(data);
      }
    };

    loadProfile();
  }, [navigate]);

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button variant="ghost" size="icon" className="rounded-full">
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <div className="flex-1 -space-y-1">
        <h1 className="text-2xl font-bold font-inter">{profile.restaurant_name || "Restaurant"}</h1>
        <p className="text-gray-500 font-inter text-sm">by {profile.owner_name || "Owner"}</p>
      </div>
    </div>
  );
};
