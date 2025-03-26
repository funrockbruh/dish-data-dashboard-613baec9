import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RestaurantProfile } from "@/hooks/use-restaurant-profile";
interface FeaturedRestaurantHeaderProps {
  profile: RestaurantProfile;
}
export const FeaturedRestaurantHeader = ({
  profile
}: FeaturedRestaurantHeaderProps) => {
  return <Card className="flex items-center justify-between gap-4 mb-8 p-4 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center gap-4">
        {profile.logo_url && <img src={profile.logo_url} alt="Restaurant logo" className="w-12 h-12 rounded-full object-cover border-2 border-gray-100" />}
        <div className="-space-y-1">
          <h1 className="text-2xl font-bold font-figtree">{profile.restaurant_name || "Just Fajita"}</h1>
          <p className="text-gray-500 text-sm font-figtree">by {profile.owner_name || "Kassem Zaiter"}</p>
        </div>
      </div>
      <Link to="/menu">
        
      </Link>
    </Card>;
};