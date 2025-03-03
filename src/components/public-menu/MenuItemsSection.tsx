
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
  if (menuItems.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Menu Items</h2>
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <div key={item.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                alt={item.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="p-2 space-y-1">
                <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                <p className="text-gray-400 text-sm truncate">{formatPrice(item.price)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
