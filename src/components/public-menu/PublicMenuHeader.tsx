
import { useState, useEffect } from "react";
import { Search, Menu, X, Edit, Phone, MessageSquare, Info, Settings } from "lucide-react";
import { MenuItem } from "@/hooks/public-menu/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";

interface Restaurant {
  id: string;
  restaurant_name: string;
  logo_url: string | null;
  owner_number?: string | null;
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
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter menu items based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = menuItems.filter(item => item.name.toLowerCase().includes(query) || item.description && item.description.toLowerCase().includes(query));
    setFilteredItems(results);
  }, [searchQuery, menuItems]);

  const handleSearchClick = () => {
    if (isSearchBarVisible) {
      // Clear search and hide search bar
      setIsSearchBarVisible(false);
      setSearchQuery("");
      setFilteredItems([]);
    } else {
      // Show search bar
      setIsSearchBarVisible(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Just prevent default form submission, results already showing
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className={`sticky top-[5px] z-50 ${filteredItems.length > 0 ? "rounded-t-2xl" : "rounded-2xl"}`}>
      <header className="bg-black/50 backdrop-blur-[15px] p-4 border border-gray-800 py-[5px] rounded-2xl">
        {!isSearchBarVisible ? <div className="flex items-center justify-between">
            <div className="rounded-full bg-white/10 p-2 cursor-pointer" onClick={handleSearchClick}>
              <Search className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex items-center justify-center">
              {restaurant?.logo_url ? <img src={restaurant.logo_url} alt={restaurant.restaurant_name || "Restaurant logo"} className="h-16 w-16 rounded-full" /> : <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center border-4 border-green-300">
                  <span className="text-gray-700 text-sm font-bold">
                    {restaurant?.restaurant_name || "Menu"}
                  </span>
                </div>}
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <button className="rounded-full bg-white/10 p-2">
                  <Menu className="h-6 w-6 text-white" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 bg-black text-white border-gray-800">
                {isAuthenticated ? (
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
                        <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                          <Edit className="h-5 w-5" />
                          <span>Edit Prices</span>
                        </li>
                        <li className="px-6 py-3 hover:bg-white/10 cursor-pointer flex items-center space-x-3">
                          <Settings className="h-5 w-5" />
                          <span>Settings</span>
                        </li>
                      </ul>
                    </nav>
                    <div className="p-6 border-t border-gray-800">
                      <button 
                        className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => supabase.auth.signOut()}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-center items-center p-6">
                    <h2 className="text-xl font-semibold mb-6">Restaurant Account</h2>
                    <p className="text-white/70 mb-8 text-center">Sign in to access your restaurant dashboard</p>
                    <button className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white mb-4">
                      Sign In
                    </button>
                    <button className="w-full py-2 px-4 rounded-lg border border-white/30 hover:bg-white/10 text-white">
                      Create Account
                    </button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div> : <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-800/80 rounded-full px-3 py-2">
              <input type="text" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white border-none outline-none" autoFocus />
              <Search className="h-6 w-6 text-white" />
            </div>
            <button type="button" onClick={handleSearchClick} className="rounded-full bg-white/10 p-2">
              <X className="h-6 w-6 text-white" />
            </button>
          </form>}
      </header>

      {/* Results panel that shows below the search bar */}
      {isSearchBarVisible && filteredItems.length > 0 && <div className="bg-black/90 backdrop-blur-[15px] max-h-[70vh] overflow-y-auto border-x border-b border-gray-800 rounded-b-2xl">
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className="overflow-hidden rounded-lg cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative w-full">
                    <AspectRatio ratio={4/3}>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </AspectRatio>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                      <div className="flex justify-between items-center">
                        <p className="text-white text-sm font-medium truncate flex-1">{item.name}</p>
                        <p className="text-white text-xs whitespace-nowrap ml-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>}

      {/* Item Detail Dialog */}
      <MenuItemDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDialog}
        item={selectedItem}
        formatPrice={formatPrice}
      />
    </div>
  );
};
