
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { MenuItem, Restaurant } from "@/hooks/public-menu/types";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";
import { supabase } from "@/lib/supabase";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { MenuSidebar } from "./MenuSidebar";

interface PublicMenuHeaderProps {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  formatPrice: (price: number) => string;
  themeSettings?: any;
}

export const PublicMenuHeader = ({
  restaurant,
  menuItems,
  formatPrice,
  themeSettings = {}
}: PublicMenuHeaderProps) => {
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
    const results = menuItems.filter(item => 
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

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedItem(null);
  };

  // Get header style based on theme settings
  const getHeaderStyle = () => {
    let style: React.CSSProperties = { 
      backdropFilter: 'blur(15px)'
    };
    
    if (themeSettings?.popupImage) {
      return {
        ...style,
        backgroundImage: `url(${themeSettings.popupImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      };
    } else if (themeSettings?.popupColor) {
      return {
        ...style,
        backgroundColor: `${themeSettings.popupColor}80` // Add 50% transparency
      };
    } else if (themeSettings?.isLightTheme) {
      return {
        ...style,
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
      };
    }
    
    return {
      ...style,
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    };
  };

  // Determine text color based on theme
  const textColor = themeSettings?.isLightTheme ? 'text-black' : 'text-white';
  const borderColor = themeSettings?.isLightTheme ? 'border-gray-300' : 'border-gray-800';

  return (
    <div className={`sticky top-[5px] z-50 ${filteredItems.length > 0 ? "rounded-t-2xl" : "rounded-2xl"}`}>
      <header 
        className={`backdrop-blur-[15px] p-4 border py-[5px] rounded-2xl ${borderColor}`} 
        style={getHeaderStyle()}
      >
        <div className="flex items-center justify-between">
          <SearchBar 
            isVisible={isSearchBarVisible}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleVisibility={handleSearchClick}
            onSubmit={handleSearchSubmit}
            textColor={textColor}
          />
          
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
          
          <MenuSidebar 
            restaurant={restaurant} 
            isAuthenticated={isAuthenticated} 
          />
        </div>
      </header>

      {/* Search Results */}
      <SearchResults 
        isVisible={isSearchBarVisible}
        searchQuery={searchQuery}
        items={filteredItems}
        formatPrice={formatPrice}
        onItemClick={handleItemClick}
        textColor={textColor}
      />

      {/* Item Detail Dialog */}
      <MenuItemDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDialog}
        item={selectedItem}
        formatPrice={formatPrice}
        themeSettings={themeSettings}
      />
    </div>
  );
};
