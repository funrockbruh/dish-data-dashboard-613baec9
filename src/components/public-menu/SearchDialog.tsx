
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MenuItem } from "@/hooks/public-menu/types";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  formatPrice: (price: number) => string;
  initialSearchQuery?: string;
}

export const SearchDialog = ({ 
  isOpen, 
  onClose, 
  menuItems, 
  formatPrice,
  initialSearchQuery = ""
}: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const openItemDetail = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  useEffect(() => {
    // Update searchQuery when initialSearchQuery changes or dialog opens
    if (isOpen && initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [isOpen, initialSearchQuery]);

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

  useEffect(() => {
    if (isOpen) {
      // Focus the input field when dialog opens
      const input = document.getElementById("search-input");
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    } else {
      // Reset search when dialog closes
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="p-0 gap-0 bg-black sm:rounded-lg max-w-md max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 z-10 flex items-center p-2 bg-gray-800">
            <Input
              id="search-input"
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoComplete="off"
            />
            <button 
              onClick={onClose}
              className="ml-2 p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
            {searchQuery.trim() === "" ? (
              <div className="p-8 text-center text-gray-500">
                Type to search menu items
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No items found matching "{searchQuery}"
              </div>
            ) : (
              <div className="p-2">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="mb-4 cursor-pointer hover:bg-gray-900 active:bg-gray-800 rounded-lg p-2 transition-colors"
                    onClick={() => openItemDetail(item)}
                  >
                    <div className="flex gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-white font-medium">{item.name}</h3>
                          <p className="text-white font-medium">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MenuItemDetailDialog 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        item={selectedItem} 
        formatPrice={formatPrice}
      />
    </>
  );
};
