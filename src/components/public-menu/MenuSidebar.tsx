
import { Edit, Info, MessageSquare, Phone, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "@/hooks/public-menu/types";
import { Facebook, Instagram, Smartphone } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { useEffect, useState } from "react";

interface MenuSidebarProps {
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
}

export const MenuSidebar = ({
  restaurant,
  isAuthenticated
}: MenuSidebarProps) => {
  const navigate = useNavigate();
  const [socialMedia, setSocialMedia] = useState({
    whatsapp: false,
    instagram: false,
    facebook: false,
    tiktok: false
  });

  // Fetch the latest restaurant data to ensure we have up-to-date social media links
  useEffect(() => {
    if (restaurant?.id) {
      checkSocialMediaLinks();
    }
  }, [restaurant]);

  const checkSocialMediaLinks = async () => {
    if (!restaurant?.id) return;
    
    try {
      // Fetch the latest restaurant profile data
      const { data, error } = await supabase
        .from('restaurant_profiles')
        .select('social_whatsapp, social_instagram, social_facebook, social_tiktok')
        .eq('id', restaurant.id)
        .single();
      
      if (error) {
        console.error('Error fetching social media links:', error);
        return;
      }
      
      // Update the social media state based on the presence of links
      setSocialMedia({
        whatsapp: !!data.social_whatsapp,
        instagram: !!data.social_instagram,
        facebook: !!data.social_facebook,
        tiktok: !!data.social_tiktok
      });
      
      console.log('Social media data:', data);
    } catch (error) {
      console.error('Error in checkSocialMediaLinks:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSignIn = () => {
    window.location.href = "/";
  };

  const handleContactClick = () => {
    if (restaurant?.social_whatsapp) {
      const formattedNumber = restaurant.social_whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    } else if (restaurant?.owner_number) {
      const formattedNumber = restaurant.owner_number.replace(/\D/g, '');
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleEmailClick = () => {
    if (restaurant?.social_email) {
      window.location.href = `mailto:${restaurant.social_email}`;
    } else if (restaurant?.owner_email) {
      window.location.href = `mailto:${restaurant.owner_email}`;
    }
  };

  const handleSocialClick = (url: string | null | undefined) => {
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank');
    }
  };

  // Debug function to check what social media links are available
  const logSocialMediaData = () => {
    console.log("Restaurant social media data:", {
      whatsapp: restaurant?.social_whatsapp,
      instagram: restaurant?.social_instagram,
      facebook: restaurant?.social_facebook,
      tiktok: restaurant?.social_tiktok,
      socialMediaState: socialMedia
    });
  };

  // Call this in development to debug social media links
  useEffect(() => {
    logSocialMediaData();
  }, [restaurant, socialMedia]);

  return <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-full bg-white/10 p-2">
          <Menu className="h-6 w-6 text-white" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 bg-black text-white border-gray-800">
        <div className="flex flex-col h-full rounded-2xl">
          <div className="p-6 border-b border-gray-800 flex flex-col items-center space-y-4 rounded-2xl">
            {restaurant?.logo_url ? <img src={restaurant.logo_url} alt={restaurant.restaurant_name || "Restaurant logo"} className="h-24 w-24 rounded-full object-cover" /> : <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center border-4 border-green-300">
                <span className="text-gray-700 text-sm font-bold">
                  {restaurant?.restaurant_name || "Menu"}
                </span>
              </div>}
            <h2 className="text-2xl font-bold text-center">{restaurant?.restaurant_name}</h2>
            {(restaurant?.social_whatsapp || restaurant?.owner_number) && <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{restaurant?.social_whatsapp || restaurant?.owner_number}</span>
              </div>}
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <ul className="py-4">
              <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3" onClick={handleContactClick}>
                <MessageSquare className="h-5 w-5" />
                <span>Contact us</span>
              </li>
              <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                <Info className="h-5 w-5" />
                <span>About us</span>
              </li>
              
              {isAuthenticated && <>
                  <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                    <Edit className="h-5 w-5" />
                    <span>Edit Prices</span>
                  </li>
                  <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3" onClick={handleSettingsClick}>
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </li>
                </>}
            </ul>
          </nav>
          
          {/* Social media icons section - make this display regardless of hasSocialMedia check */}
          <div className="flex justify-center gap-4 py-4 border-t border-gray-800">
            {restaurant?.social_instagram && (
              <button 
                onClick={() => handleSocialClick(restaurant.social_instagram)} 
                className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Instagram className="h-5 w-5 text-black" />
              </button>
            )}
            
            {restaurant?.social_facebook && (
              <button 
                onClick={() => handleSocialClick(restaurant.social_facebook)} 
                className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Facebook className="h-5 w-5 text-black" />
              </button>
            )}
            
            {restaurant?.social_tiktok && (
              <button 
                onClick={() => handleSocialClick(restaurant.social_tiktok)} 
                className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <TikTokIcon className="h-5 w-5 text-black" />
              </button>
            )}
            
            {restaurant?.social_whatsapp && (
              <button 
                onClick={handleContactClick} 
                className="bg-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Smartphone className="h-5 w-5 text-black" />
              </button>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-800 rounded-2xl">
            {isAuthenticated ? <button className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white" onClick={handleSignOut}>
                Sign Out
              </button> : <button className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSignIn}>
                Sign In
              </button>}
          </div>
        </div>
      </SheetContent>
    </Sheet>;
};
