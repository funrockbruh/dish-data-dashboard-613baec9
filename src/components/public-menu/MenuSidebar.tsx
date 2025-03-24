
import { Edit, Info, MessageSquare, Phone, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "@/hooks/public-menu/types";

interface MenuSidebarProps {
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
}

export const MenuSidebar = ({ restaurant, isAuthenticated }: MenuSidebarProps) => {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSignIn = () => {
    window.location.href = "/";
  };

  const handleContactClick = () => {
    if (restaurant?.social_whatsapp) {
      // Format the phone number to ensure it's in the correct format for WhatsApp
      // Remove any spaces, dashes, or other non-digit characters
      const formattedNumber = restaurant.social_whatsapp.replace(/\D/g, '');
      
      // Open WhatsApp with the formatted number
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    } else if (restaurant?.owner_number) {
      // Fall back to owner_number if WhatsApp not set
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
      // Add https:// if not present
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank');
    }
  };

  // Function to check if any social media link exists
  const hasSocialMedia = () => {
    return !!(
      restaurant?.social_instagram || 
      restaurant?.social_facebook || 
      restaurant?.social_tiktok || 
      restaurant?.social_whatsapp
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-full bg-white/10 p-2">
          <Menu className="h-6 w-6 text-white" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 bg-black text-white border-gray-800">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-800 flex flex-col items-center space-y-4">
            {restaurant?.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.restaurant_name || "Restaurant logo"} 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center border-4 border-green-300">
                <span className="text-gray-700 text-sm font-bold">
                  {restaurant?.restaurant_name || "Menu"}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-center">{restaurant?.restaurant_name}</h2>
            {(restaurant?.social_whatsapp || restaurant?.owner_number) && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{restaurant?.social_whatsapp || restaurant?.owner_number}</span>
              </div>
            )}
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <ul className="py-4">
              <li 
                className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3"
                onClick={handleContactClick}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Contact us</span>
              </li>
              <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                <Info className="h-5 w-5" />
                <span>About us</span>
              </li>
              
              {isAuthenticated && (
                <>
                  <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                    <Edit className="h-5 w-5" />
                    <span>Edit Prices</span>
                  </li>
                  <li 
                    className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </li>
                </>
              )}
            </ul>
          </nav>
          
          {/* Social Media Icons */}
          {hasSocialMedia() && (
            <div className="flex justify-center gap-4 py-4 border-t border-gray-800">
              {restaurant?.social_facebook && (
                <button
                  onClick={() => handleSocialClick(restaurant.social_facebook)}
                  className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                  </svg>
                </button>
              )}
              
              {restaurant?.social_tiktok && (
                <button
                  onClick={() => handleSocialClick(restaurant.social_tiktok)}
                  className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.38-1.5v-3.1h-.03a5.89 5.89 0 00-3.48 1.14 5.88 5.88 0 002.04 11.1 5.88 5.88 0 005.88-5.88V10.5a8.29 8.29 0 005.4 2.02v-3.45a4.83 4.83 0 01-2.77-2.38z" />
                  </svg>
                </button>
              )}
              
              {restaurant?.social_whatsapp && (
                <button
                  onClick={handleContactClick}
                  className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>
              )}
              
              {restaurant?.social_instagram && (
                <button
                  onClick={() => handleSocialClick(restaurant.social_instagram)}
                  className="bg-white rounded-full p-3 w-12 h-12 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          <div className="p-6 border-t border-gray-800">
            {isAuthenticated ? (
              <button 
                className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            ) : (
              <button 
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSignIn}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
