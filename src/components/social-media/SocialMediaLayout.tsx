
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRestaurantProfile } from "@/hooks/use-restaurant-profile";

interface SocialMediaLayoutProps {
  children: ReactNode;
}

export const SocialMediaLayout = ({ 
  children
}: SocialMediaLayoutProps) => {
  const navigate = useNavigate();
  const { profile } = useRestaurantProfile();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            {profile.logo_url && (
              <img 
                src={profile.logo_url} 
                alt="Restaurant logo" 
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
              />
            )}
            <div className="-space-y-0.5">
              <h1 className="text-lg font-bold">{profile.restaurant_name || "Restaurant"}</h1>
              <p className="text-sm text-gray-500">by {profile.owner_name || "Owner"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        {/* Restaurant Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center gap-3">
          {profile.logo_url && (
            <img 
              src={profile.logo_url} 
              alt="Restaurant logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
          )}
          <div className="-space-y-0.5">
            <h2 className="text-lg font-bold">{profile.restaurant_name || "Restaurant"}</h2>
            <p className="text-sm text-gray-500">by {profile.owner_name || "Owner"}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
