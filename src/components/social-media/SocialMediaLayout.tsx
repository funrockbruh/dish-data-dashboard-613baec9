import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRestaurantProfile } from "@/hooks/use-restaurant-profile";
import { Card } from "@/components/ui/card";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
interface SocialMediaLayoutProps {
  children: ReactNode;
}
export const SocialMediaLayout = ({
  children
}: SocialMediaLayoutProps) => {
  const navigate = useNavigate();
  const {
    profile
  } = useRestaurantProfile();
  return <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <Card className="flex items-center gap-4 mb-0 p-4 mx-auto max-w-xl border border-gray-200 rounded-2xl">
          <Button variant="ghost" size="icon" className="rounded-full mr-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            {profile.logo_url ? <div className="w-12 h-12 rounded-full overflow-hidden">
                <ImageWithSkeleton src={profile.logo_url} alt="Restaurant logo" className="w-12 h-12 object-cover" fallbackClassName="w-12 h-12 rounded-full" />
              </div> : <div className="bg-green-100 rounded-full h-12 w-12 flex items-center justify-center border-2 border-green-300">
                <span className="text-gray-700 text-sm font-bold">
                  {profile.restaurant_name?.charAt(0) || "R"}
                </span>
              </div>}
            <div className="-space-y-1">
              <h1 className="text-2xl font-bold font-figtree">{profile.restaurant_name || "Restaurant"}</h1>
              <p className="text-gray-500 text-sm font-figtree">by {profile.owner_name || "Owner"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6 py-[15px]">
          {children}
        </div>
      </div>
    </div>;
};