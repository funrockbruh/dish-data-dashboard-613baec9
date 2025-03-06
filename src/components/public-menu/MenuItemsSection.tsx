
import { Card } from "@/components/ui/card";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_featured: boolean;
}

interface MenuItemsSectionProps {
  menuItems: MenuItem[];
  formatPrice: (price: number) => string;
}

export const MenuItemsSection = ({ menuItems, formatPrice }: MenuItemsSectionProps) => {
  if (menuItems.length === 0) {
    // Create sample menu items for demonstration
    const sampleItems = [
      { 
        id: "1", 
        name: "Grilled Chicken Sandwich", 
        description: "Grilled chicken breast with lettuce, tomato, and special sauce", 
        price: 1299, 
        image_url: "https://images.unsplash.com/photo-1521305916504-4a1121188589?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        category_id: "1", 
        is_featured: false 
      },
      { 
        id: "2", 
        name: "Classic Burger", 
        description: "Beef patty with cheese, lettuce, tomato, and special sauce", 
        price: 1499, 
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        category_id: "2", 
        is_featured: false 
      },
      { 
        id: "3", 
        name: "Mediterranean Salad", 
        description: "Fresh greens, feta cheese, olives, and house dressing", 
        price: 1099, 
        image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        category_id: "3", 
        is_featured: false 
      },
      { 
        id: "4", 
        name: "Chocolate Brownie", 
        description: "Rich chocolate brownie with vanilla ice cream", 
        price: 899, 
        image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", 
        category_id: "4", 
        is_featured: false 
      }
    ];
    
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Sample Menu</h2>
        <p className="text-gray-400 mb-6">This restaurant hasn't added their real menu items yet. Here are some samples of what could be on the menu.</p>
        <div className="grid grid-cols-2 gap-4">
          {sampleItems.map((item) => (
            <MenuItem key={item.id} item={item} formatPrice={formatPrice} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} formatPrice={formatPrice} />
        ))}
      </div>
    </section>
  );
};

interface MenuItemProps {
  item: MenuItem;
  formatPrice: (price: number) => string;
}

const MenuItem = ({ item, formatPrice }: MenuItemProps) => {
  return (
    <div className="mb-8">
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
          alt={item.name}
          className="w-full aspect-[4/3] object-cover"
        />
        <div className="p-2 bg-black">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">{item.name}</h3>
            <p className="text-white">{formatPrice(item.price)}</p>
          </div>
          {item.description && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
