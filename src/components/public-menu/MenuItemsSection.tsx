import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { MenuItem, Category, ThemeSettings } from "@/hooks/public-menu/types";
import { MenuItemDetailDialog } from "./MenuItemDetailDialog";

interface MenuItemsSectionProps {
  menuItems: MenuItem[];
  categories: Category[];
  formatPrice: (price: number) => string;
  themeSettings?: ThemeSettings;
}

export const MenuItemsSection = ({
  menuItems,
  categories,
  formatPrice,
  themeSettings
}: MenuItemsSectionProps) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const openItemDetail = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  // Group menu items by category
  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = menuItems.filter(item => item.category_id === category.id);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Get the current template
  const template = themeSettings?.template || "template1";

  // Handle case when no menu items exist
  if (menuItems.length === 0) {
    // Create sample menu items for demonstration
    const sampleItems: MenuItem[] = [
      {
        id: "1",
        name: "Grilled Chicken Sandwich",
        description: "Grilled chicken breast with lettuce, tomato, and special sauce",
        price: 1299,
        image_url: "https://images.unsplash.com/photo-1521305916504-4a1121188589?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category_id: "1",
        is_featured: false,
        restaurant_id: "sample"
      },
      {
        id: "2",
        name: "Classic Burger",
        description: "Beef patty with cheese, lettuce, tomato, and special sauce",
        price: 1499,
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category_id: "2",
        is_featured: false,
        restaurant_id: "sample"
      },
      {
        id: "3",
        name: "Mediterranean Salad",
        description: "Fresh greens, feta cheese, olives, and house dressing",
        price: 1099,
        image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category_id: "3",
        is_featured: false,
        restaurant_id: "sample"
      },
      {
        id: "4",
        name: "Chocolate Brownie",
        description: "Rich chocolate brownie with vanilla ice cream",
        price: 899,
        image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        category_id: "4",
        is_featured: false,
        restaurant_id: "sample"
      }
    ];
    
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Sample Menu</h2>
        <p className="text-gray-400 mb-6">This restaurant hasn't added their real menu items yet. Here are some samples of what could be on the menu.</p>
        <div className={getGridClassByTemplate(template)}>
          {sampleItems.map(item => (
            <MenuItemComponent 
              key={item.id} 
              item={item} 
              formatPrice={formatPrice} 
              onClick={() => openItemDetail(item)}
              template={template}
            />
          ))}
        </div>
        <MenuItemDetailDialog 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
          item={selectedItem} 
          formatPrice={formatPrice} 
          themeSettings={themeSettings}
        />
      </section>
    );
  }
  
  return (
    <section>
      {categories.map(category => {
        const categoryItems = itemsByCategory[category.id] || [];
        if (categoryItems.length === 0) return null;
        
        return (
          <div key={category.id} id={`category-${category.id}`} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-2">{category.name}</h2>
            <div className={getGridClassByTemplate(template)}>
              {categoryItems.map(item => (
                <MenuItemComponent 
                  key={item.id} 
                  item={item} 
                  formatPrice={formatPrice} 
                  onClick={() => openItemDetail(item)}
                  template={template}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {/* For uncategorized items (if any) */}
      {menuItems.filter(item => !item.category_id || !categories.some(c => c.id === item.category_id)).length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-2">Other Items</h2>
          <div className={getGridClassByTemplate(template)}>
            {menuItems.filter(item => !item.category_id || !categories.some(c => c.id === item.category_id)).map(item => (
              <MenuItemComponent 
                key={item.id} 
                item={item} 
                formatPrice={formatPrice} 
                onClick={() => openItemDetail(item)}
                template={template}
              />
            ))}
          </div>
        </div>
      )}

      <MenuItemDetailDialog 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        item={selectedItem} 
        formatPrice={formatPrice}
        themeSettings={themeSettings}
      />
    </section>
  );
};

function getGridClassByTemplate(template: string): string {
  switch (template) {
    case "template1": // Classic Menu
      return "grid grid-cols-2 gap-4";
    case "template2": // Modern Grid
      return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6";
    case "template3": // Elegant List
      return "flex flex-col space-y-4";
    case "template4": // Card View
      return "grid grid-cols-1 sm:grid-cols-2 gap-6";
    case "template5": // Compact Layout
      return "grid grid-cols-2 sm:grid-cols-3 gap-2";
    default:
      return "grid grid-cols-2 gap-4";
  }
}

interface MenuItemProps {
  item: MenuItem;
  formatPrice: (price: number) => string;
  onClick: () => void;
  template: string;
}

const MenuItemComponent = ({
  item,
  formatPrice,
  onClick,
  template
}: MenuItemProps) => {
  // Different layouts based on template
  switch (template) {
    case "template1": // Classic Menu
      return (
        <div className="mb-4 cursor-pointer active:scale-95 transition-transform" onClick={onClick}>
          <div className="relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img 
              src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
              alt={item.name} 
              className="w-full aspect-[4/3] object-cover rounded-[10px]" 
            />
            <div className="p-2 bg-black">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">{item.name}</h3>
                <p className="text-white">{formatPrice(item.price)}</p>
              </div>
            </div>
          </div>
        </div>
      );
      
    case "template2": // Modern Grid
      return (
        <div className="cursor-pointer hover:scale-[1.02] transition-all duration-200" onClick={onClick}>
          <div className="bg-black/80 rounded-xl overflow-hidden border border-gray-700">
            <img 
              src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
              alt={item.name} 
              className="w-full aspect-square object-cover" 
            />
            <div className="p-4">
              <h3 className="text-white text-xl font-bold mb-1">{item.name}</h3>
              {item.description && (
                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{item.description}</p>
              )}
              <p className="text-white font-bold text-lg">{formatPrice(item.price)}</p>
            </div>
          </div>
        </div>
      );
      
    case "template3": // Elegant List
      return (
        <div 
          className="cursor-pointer p-4 border-b border-gray-800 hover:bg-white/5 transition-colors flex justify-between items-center"
          onClick={onClick}
        >
          <div className="flex items-center space-x-4">
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-16 h-16 rounded-full object-cover" 
              />
            )}
            <div>
              <h3 className="text-white text-lg font-medium">{item.name}</h3>
              {item.description && (
                <p className="text-gray-400 text-sm line-clamp-1">{item.description}</p>
              )}
            </div>
          </div>
          <p className="text-white font-bold">{formatPrice(item.price)}</p>
        </div>
      );
      
    case "template4": // Card View
      return (
        <div className="cursor-pointer" onClick={onClick}>
          <Card className="overflow-hidden bg-gray-900 border-gray-800">
            {item.image_url && (
              <div className="relative h-48">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between mb-2">
                <h3 className="text-white text-xl font-bold">{item.name}</h3>
                <p className="text-white font-bold">{formatPrice(item.price)}</p>
              </div>
              {item.description && (
                <p className="text-gray-400 line-clamp-2">{item.description}</p>
              )}
            </div>
          </Card>
        </div>
      );
      
    case "template5": // Compact Layout
      return (
        <div className="cursor-pointer hover:bg-white/5 transition-colors p-2" onClick={onClick}>
          <div className="text-center">
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-full aspect-square object-cover rounded-lg mb-2" 
              />
            )}
            <h3 className="text-white font-medium text-sm">{item.name}</h3>
            <p className="text-white text-xs">{formatPrice(item.price)}</p>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="mb-4 cursor-pointer" onClick={onClick}>
          <div className="rounded-lg overflow-hidden">
            <img 
              src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
              alt={item.name} 
              className="w-full aspect-[4/3] object-cover" 
            />
            <div className="p-2 bg-black">
              <h3 className="text-white">{item.name}</h3>
              <p className="text-white">{formatPrice(item.price)}</p>
            </div>
          </div>
        </div>
      );
  }
};
