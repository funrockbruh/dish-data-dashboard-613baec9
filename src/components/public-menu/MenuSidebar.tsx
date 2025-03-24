
import { Edit, Info, MessageSquare, Phone, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "@/hooks/public-menu/types";

interface MenuSidebarProps {
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  isLightTheme?: boolean;
}

export const MenuSidebar = ({ restaurant, isAuthenticated, isLightTheme = true }: MenuSidebarProps) => {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSignIn = () => {
    window.location.href = "/";
  };

  const handleContactClick = () => {
    if (restaurant?.owner_number) {
      // Format the phone number to ensure it's in the correct format for WhatsApp
      // Remove any spaces, dashes, or other non-digit characters
      const formattedNumber = restaurant.owner_number.replace(/\D/g, '');
      
      // Open WhatsApp with the formatted number
      window.open(`https://wa.me/${formattedNumber}`, '_blank');
    }
  };
  
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={`rounded-full ${isLightTheme ? 'bg-gray-200/80' : 'bg-white/10'} p-2`}>
          <Menu className={`h-6 w-6 ${isLightTheme ? 'text-gray-700' : 'text-white'}`} />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className={`w-[300px] p-0 ${isLightTheme ? 'bg-white text-gray-800 border-gray-200' : 'bg-black text-white border-gray-800'}`}>
        <div className="flex flex-col h-full">
          <div className={`p-6 border-b ${isLightTheme ? 'border-gray-200' : 'border-gray-800'} flex flex-col items-center space-y-4`}>
            {restaurant?.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.restaurant_name || "Restaurant logo"} 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className={`rounded-full h-24 w-24 flex items-center justify-center border-4 ${
                isLightTheme ? "bg-green-100 border-green-300 text-gray-700" : "bg-green-900 border-green-700 text-white"
              }`}>
                <span className="text-sm font-bold">
                  {restaurant?.restaurant_name || "Menu"}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-center">{restaurant?.restaurant_name}</h2>
            {restaurant?.owner_number && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{restaurant.owner_number}</span>
              </div>
            )}
          </div>
          
          <nav className="flex-1">
            <ul className="py-4">
              <li 
                className={`px-6 py-3 hover:${isLightTheme ? 'bg-gray-100' : 'bg-white/10'} cursor-pointer flex items-center space-x-3`}
                onClick={handleContactClick}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Contact us</span>
              </li>
              <li className={`px-6 py-3 hover:${isLightTheme ? 'bg-gray-100' : 'bg-white/10'} cursor-pointer flex items-center space-x-3`}>
                <Info className="h-5 w-5" />
                <span>About us</span>
              </li>
              
              {isAuthenticated && (
                <>
                  <li className={`px-6 py-3 hover:${isLightTheme ? 'bg-gray-100' : 'bg-white/10'} cursor-pointer flex items-center space-x-3`}>
                    <Edit className="h-5 w-5" />
                    <span>Edit Prices</span>
                  </li>
                  <li 
                    className={`px-6 py-3 hover:${isLightTheme ? 'bg-gray-100' : 'bg-white/10'} cursor-pointer flex items-center space-x-3`}
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </li>
                </>
              )}
            </ul>
          </nav>
          
          <div className={`p-6 border-t ${isLightTheme ? 'border-gray-200' : 'border-gray-800'}`}>
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
