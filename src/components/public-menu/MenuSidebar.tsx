
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
    if (restaurant?.whatsapp || restaurant?.owner_number) {
      // Prefer the whatsapp number if available, otherwise use owner_number
      const phoneNumber = restaurant.whatsapp || restaurant.owner_number;
      if (phoneNumber) {
        // Format the phone number to ensure it's in the correct format for WhatsApp
        // Remove any spaces, dashes, or other non-digit characters
        const formattedNumber = phoneNumber.replace(/\D/g, '');
        
        // Open WhatsApp with the formatted number
        window.open(`https://wa.me/${formattedNumber}`, '_blank');
      }
    }
  };
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleEmailClick = () => {
    if (restaurant?.email) {
      window.location.href = `mailto:${restaurant.email}`;
    }
  };

  const handleSocialClick = (url: string | null | undefined) => {
    if (url) {
      // Add https:// if not present
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank');
    }
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
            {(restaurant?.owner_number || restaurant?.whatsapp) && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{restaurant?.whatsapp || restaurant?.owner_number}</span>
              </div>
            )}
          </div>
          
          <nav className="flex-1">
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
              
              {/* Social Media Links */}
              {restaurant?.instagram && (
                <li 
                  className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3"
                  onClick={() => handleSocialClick(restaurant.instagram)}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <span>Instagram</span>
                </li>
              )}
              
              {restaurant?.facebook && (
                <li 
                  className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3"
                  onClick={() => handleSocialClick(restaurant.facebook)}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                  </svg>
                  <span>Facebook</span>
                </li>
              )}
              
              {restaurant?.tiktok && (
                <li 
                  className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3"
                  onClick={() => handleSocialClick(restaurant.tiktok)}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.38-1.5v-3.1h-.03a5.89 5.89 0 00-3.48 1.14 5.88 5.88 0 002.04 11.1 5.88 5.88 0 005.88-5.88V10.5a8.29 8.29 0 005.4 2.02v-3.45a4.83 4.83 0 01-2.77-2.38z" />
                  </svg>
                  <span>TikTok</span>
                </li>
              )}
              
              {restaurant?.email && (
                <li 
                  className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3"
                  onClick={handleEmailClick}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Email</span>
                </li>
              )}
              
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
