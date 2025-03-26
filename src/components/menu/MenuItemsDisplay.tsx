
import { Card } from "@/components/ui/card";
import { MenuItemCard } from "./MenuItemCard";
import { MenuItem, Category } from "@/hooks/use-menu-data";
import { useIsMobile } from "@/hooks/use-mobile";

interface MenuItemsDisplayProps {
  isLoading: boolean;
  items: MenuItem[];
  filteredItems: MenuItem[];
  categories: Category[];
  searchQuery: string;
  onEdit: (item: MenuItem) => void;
}

export const MenuItemsDisplay = ({ 
  isLoading, 
  filteredItems, 
  categories, 
  searchQuery, 
  onEdit 
}: MenuItemsDisplayProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? "No items found" : "Add your first menu item!"}
          </div>
        ) : (
          filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              categoryName={categories.find(c => c.id === item.category_id)?.name || ""}
              onEdit={() => onEdit(item)}
            />
          ))
        )}
      </div>
    </Card>
  );
};
