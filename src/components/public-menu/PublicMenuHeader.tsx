import { useState } from "react";
import { Search, Menu } from "lucide-react";
import { SearchDialog } from "./SearchDialog";
import { MenuItem } from "@/hooks/public-menu/types";
interface Restaurant {
  id: string;
  restaurant_name: string;
  logo_url: string | null;
}
interface PublicMenuHeaderProps {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  formatPrice: (price: number) => string;
}
export const PublicMenuHeader = ({
  restaurant,
  menuItems,
  formatPrice
}: PublicMenuHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return <>
      <header className="sticky top-[5px] z-50 bg-black/80 backdrop-blur-[10px] p-4 border border-gray-800 py-[5px] rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-white/10 p-2" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex items-center justify-center">
            {restaurant?.logo_url ? <img src={restaurant.logo_url} alt={restaurant.restaurant_name || "Restaurant logo"} className="h-16 w-16 rounded-full" /> : <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center border-4 border-green-300">
                <span className="text-gray-700 text-sm font-bold">{restaurant?.restaurant_name || "Menu"}</span>
              </div>}
          </div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full bg-white/10 p-2">
            <Menu className="h-6 w-6 text-white" />
          </button>
        </div>
      </header>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} menuItems={menuItems} formatPrice={formatPrice} />
    </>;
};