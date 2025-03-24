
import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
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
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  // Filter menu items based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = menuItems.filter(
      item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
    );
    
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

  return (
    <div className={`sticky top-[5px] z-50 ${filteredItems.length > 0 ? "rounded-t-2xl" : "rounded-2xl"}`}>
      <header className="bg-black/50 backdrop-blur-[15px] p-4 border border-gray-800 py-[5px] rounded-t-2xl">
        {!isSearchBarVisible ? (
          <div className="flex items-center justify-between">
            <div 
              className="rounded-full bg-white/10 p-2 cursor-pointer" 
              onClick={handleSearchClick}
            >
              <Search className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex items-center justify-center">
              {restaurant?.logo_url ? (
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.restaurant_name || "Restaurant logo"} 
                  className="h-16 w-16 rounded-full" 
                />
              ) : (
                <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center border-4 border-green-300">
                  <span className="text-gray-700 text-sm font-bold">
                    {restaurant?.restaurant_name || "Menu"}
                  </span>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="rounded-full bg-white/10 p-2"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-800/80 rounded-full px-3 py-2">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white border-none outline-none"
                autoFocus
              />
              <Search className="h-6 w-6 text-white" />
            </div>
            <button 
              type="button" 
              onClick={handleSearchClick} 
              className="rounded-full bg-white/10 p-2"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </form>
        )}
      </header>

      {/* Results panel that shows below the search bar */}
      {isSearchBarVisible && filteredItems.length > 0 && (
        <div className="bg-black/90 backdrop-blur-[15px] max-h-[70vh] overflow-y-auto border-x border-b border-gray-800 rounded-b-2xl">
          <div className="p-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="mb-4">
                <div className="flex gap-3">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-white font-medium">
                      {formatPrice(item.price)}
                    </p>
                    {item.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
