
import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { MenuItem, Category } from "@/hooks/public-menu/types";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface MenuItemsSectionProps {
  menuItems: MenuItem[];
  categories: Category[];
  formatPrice: (price: number) => string;
}

export const MenuItemsSection = ({
  menuItems,
  categories,
  formatPrice
}: MenuItemsSectionProps) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const openItemDetail = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  // Group menu items by category
  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = menuItems.filter(item => item.category_id === category.id);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Truncate description for mobile view
  const getDisplayDescription = (description: string) => {
    if (!description) return "";
    
    if (isMobile) {
      // For mobile, show approximately 12 characters
      if (description.length > 12) {
        return description.substring(0, 12) + "...";
      }
    }
    return description;
  };

  // Handle case when no menu items exist
  if (menuItems.length === 0) {
    // Create sample menu items for demonstration
    const sampleItems: MenuItem[] = [{
      id: "1",
      name: "Grilled Chicken Sandwich",
      description: "Grilled chicken breast with lettuce, tomato, and special sauce",
      price: 1299,
      image_url: "https://images.unsplash.com/photo-1521305916504-4a1121188589?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category_id: "1",
      is_featured: false
    }, {
      id: "2",
      name: "Classic Burger",
      description: "Beef patty with cheese, lettuce, tomato, and special sauce",
      price: 1499,
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category_id: "2",
      is_featured: false
    }, {
      id: "3",
      name: "Mediterranean Salad",
      description: "Fresh greens, feta cheese, olives, and house dressing",
      price: 1099,
      image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category_id: "3",
      is_featured: false
    }, {
      id: "4",
      name: "Chocolate Brownie",
      description: "Rich chocolate brownie with vanilla ice cream",
      price: 899,
      image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category_id: "4",
      is_featured: false
    }];
    return <section>
        <h2 className="text-2xl font-bold mb-4">Sample Menu</h2>
        <p className="text-gray-400 mb-6">This restaurant hasn't added their real menu items yet. Here are some samples of what could be on the menu.</p>
        <div className="grid grid-cols-2 gap-4">
          {sampleItems.map(item => <MenuItemComponent 
            key={item.id} 
            item={item} 
            formatPrice={formatPrice} 
            onClick={() => openItemDetail(item)} 
            getDisplayDescription={getDisplayDescription}
          />)}
        </div>
        <MenuItemDetailDialog isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} item={selectedItem} formatPrice={formatPrice} />
      </section>;
  }
  
  return <section>
      {categories.map(category => {
      const categoryItems = itemsByCategory[category.id] || [];
      if (categoryItems.length === 0) return null;
      return <div key={category.id} id={`category-${category.id}`} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-2">{category.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              {categoryItems.map(item => <MenuItemComponent 
                key={item.id} 
                item={item} 
                formatPrice={formatPrice} 
                onClick={() => openItemDetail(item)} 
                getDisplayDescription={getDisplayDescription}
              />)}
            </div>
          </div>;
    })}
      
      {/* For uncategorized items (if any) */}
      {menuItems.filter(item => !item.category_id || !categories.some(c => c.id === item.category_id)).length > 0 && <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-2">Other Items</h2>
          <div className="grid grid-cols-2 gap-4">
            {menuItems.filter(item => !item.category_id || !categories.some(c => c.id === item.category_id)).map(item => <MenuItemComponent 
              key={item.id} 
              item={item} 
              formatPrice={formatPrice} 
              onClick={() => openItemDetail(item)} 
              getDisplayDescription={getDisplayDescription}
            />)}
          </div>
        </div>}

      <MenuItemDetailDialog isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} item={selectedItem} formatPrice={formatPrice} />
    </section>;
};

interface MenuItemProps {
  item: MenuItem;
  formatPrice: (price: number) => string;
  onClick: () => void;
  getDisplayDescription: (description: string) => string;
}

const MenuItemComponent = ({
  item,
  formatPrice,
  onClick,
  getDisplayDescription
}: MenuItemProps) => {
  const isMobile = useIsMobile();
  
  return <div className="mb-4 cursor-pointer active:scale-95 transition-transform" onClick={onClick}>
      <div className="relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="w-full aspect-[4/3]">
          <ImageWithSkeleton
            src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
            alt={item.name}
            className="w-full h-full object-cover rounded-[10px]"
          />
        </div>
        <div className="p-2 bg-black">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium truncate max-w-[70%]">{item.name}</h3>
            <p className="text-white">{formatPrice(item.price)}</p>
          </div>
          {item.description && (
            <div className="relative">
              <p className="text-gray-300 text-xs truncate">{getDisplayDescription(item.description)}</p>
              {isMobile && item.description.length > 12 && (
                <div 
                  className="absolute right-0 top-0 h-full w-8 pointer-events-none" 
                  style={{ 
                    background: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)' 
                  }}
                ></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>;
};
