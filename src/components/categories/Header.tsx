
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export const Header = () => {
  const [profile, setProfile] = useState<{
    restaurant_name: string | null;
    owner_name: string | null;
    logo_url: string | null;
  }>({
    restaurant_name: "",
    owner_name: "",
    logo_url: null
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
        .select('restaurant_name, owner_name, logo_url')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        setProfile(data);
      }
    };

    loadProfile();
  }, [navigate]);

  return (
    <Card className="flex items-center gap-4 mb-8 p-4 bg-white border border-gray-200 rounded-2xl">
      <Button variant="ghost" size="icon" className="rounded-full">
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <div className="flex items-center gap-3 flex-1">
        {profile.logo_url && (
          <img 
            src={profile.logo_url} 
            alt="Restaurant logo" 
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
          />
        )}
        <div className="-space-y-1">
          <h1 className="text-2xl font-bold font-figtree">{profile.restaurant_name || "Restaurant"}</h1>
          <p className="text-gray-500 text-sm font-figtree">by {profile.owner_name || "Owner"}</p>
        </div>
      </div>
    </Card>
  );
};
