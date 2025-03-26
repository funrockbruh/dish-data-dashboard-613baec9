
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { RestaurantProfile } from "@/hooks/use-menu-data";

interface RestaurantHeaderProps {
  profile: RestaurantProfile;
}

export const RestaurantHeader = ({ profile }: RestaurantHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    // If there's state from a previous location, go back there
    if (location.state?.from) {
      navigate(`/${location.state.from}`);
    } else {
      navigate(-1); // Fallback to browser history
    }
  };

  return (
    <Card className="flex items-center gap-4 mb-8 p-4 bg-white border border-gray-200 rounded-2xl">
      <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
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
