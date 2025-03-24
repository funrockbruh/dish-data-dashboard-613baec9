import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { MenuItem, Restaurant, ThemeSettings } from "@/hooks/public-menu/types";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";
import { supabase } from "@/lib/supabase";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { MenuSidebar } from "./MenuSidebar";

interface PublicMenuHeaderProps {
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  formatPrice: (price: number) => string;
  themeSettings?: ThemeSettings;
}

export const PublicMenuHeader = ({
  restaurant,
  menuItems,
  formatPrice,
  themeSettings
}: PublicMenuHeaderProps) => {
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get theme settings
  const isLightTheme = themeSettings?.isLightTheme !== false;
  const template = themeSettings?.template || "template1";

  // Header styles based on theme
  const getHeaderStyle = () => {
    const baseStyle = "sticky top-[5px] z-50";
    const roundedStyle = filteredItems.length > 0 ? "rounded-t-2xl" : "rounded-2xl";
    
    return `${baseStyle} ${roundedStyle}`;
  };

  const getHeaderBgStyle = () => {
    const baseStyle = "backdrop-blur-[15px] p-4 border py-[5px] rounded-2xl";
    
    if (isLightTheme) {
      return `${baseStyle} bg-white/50 border-gray-200`;
    } else {
      return `${baseStyle} bg-black/50 border-gray-800`;
    }
  };

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

  return (
    <div className={getHeaderStyle()}>
      <header className={getHeaderBgStyle()}>
        <div className="flex items-center justify-between">
          <SearchBar 
            isVisible={isSearchBarVisible}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleVisibility={handleSearchClick}
            onSubmit={handleSearchSubmit}
            isLightTheme={isLightTheme}
          />
          
          <div className="flex items-center justify-center">
            {restaurant?.logo_url ? (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.restaurant_name || "Restaurant logo"} 
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className={`rounded-full h-16 w-16 flex items-center justify-center border-4 ${
                isLightTheme ? "bg-green-100 border-green-300 text-gray-700" : "bg-green-900 border-green-700 text-white"
              }`}>
                <span className="text-sm font-bold">
                  {restaurant?.restaurant_name || "Menu"}
                </span>
              </div>
            )}
          </div>
          
          <MenuSidebar 
            restaurant={restaurant} 
            isAuthenticated={isAuthenticated}
            isLightTheme={isLightTheme}
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
        isLightTheme={isLightTheme}
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
