
import { Card } from "@/components/ui/card";
import { RestaurantProfile } from "@/hooks/use-menu-data";

interface RestaurantHeaderProps {
  profile: RestaurantProfile;
}

export const RestaurantHeader = ({ profile }: RestaurantHeaderProps) => {
  return (
    <Card className="flex items-center gap-4 mb-8 p-4 bg-white border border-gray-200 rounded-2xl">
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
    </Card>
  );
};
