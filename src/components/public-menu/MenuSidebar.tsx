
import { Edit, Info, MessageSquare, Phone, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Restaurant } from "@/hooks/public-menu/types";

interface MenuSidebarProps {
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
}

export const MenuSidebar = ({ restaurant, isAuthenticated }: MenuSidebarProps) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSignIn = () => {
    window.location.href = "/";
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
            {restaurant?.owner_number && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{restaurant.owner_number}</span>
              </div>
            )}
          </div>
          
          <nav className="flex-1">
            <ul className="py-4">
              <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
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
                  <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
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
