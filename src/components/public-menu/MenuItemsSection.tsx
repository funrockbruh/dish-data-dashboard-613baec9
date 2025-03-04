
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
        name: "Fahita", 
        description: null, 
        price: 45000000, 
        image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9", 
        category_id: "1", 
        is_featured: false 
      },
      { 
        id: "2", 
        name: "Twister", 
        description: null, 
        price: 47000000, 
        image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9", 
        category_id: "2", 
        is_featured: false 
      },
      { 
        id: "3", 
        name: "Lebanese burger", 
        description: null, 
        price: 51000000, 
        image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9", 
        category_id: "1", 
        is_featured: false 
      },
      { 
        id: "4", 
        name: "Zinger 112", 
        description: null, 
        price: 54000000, 
        image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9", 
        category_id: "1", 
        is_featured: false 
      }
    ];
    
    return (
      <section>
        <div className="grid grid-cols-2 gap-4">
          {sampleItems.map((item) => (
            <MenuItem key={item.id} item={item} formatPrice={(price) => `${price.toLocaleString()} L.L.`} />
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
        </div>
      </div>
    </div>
  );
};
