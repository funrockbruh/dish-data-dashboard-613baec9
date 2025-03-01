
import { useState } from "react";
import { X, Plus, Search } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
}

interface AddFeaturedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MenuItem[];
  featuredItems: MenuItem[];
  onAddFeatured: (item: MenuItem) => void;
}

export const AddFeaturedDialog = ({ 
  open, 
  onOpenChange, 
  items, 
  featuredItems,
  onAddFeatured 
}: AddFeaturedDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter out already featured items and apply search
  const availableItems = items.filter(item => 
    !featuredItems.some(featured => featured.id === item.id) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border rounded-xl">
        <div className="p-4 flex items-center justify-between">
          <DialogTitle className="text-xl font-bold">Add Featured:</DialogTitle>
          <button 
            onClick={() => onOpenChange(false)} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 pt-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {availableItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No items available to feature
              </div>
            ) : (
              availableItems.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"} 
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{item.name}</h3>
                        <span className="font-semibold">{formattedPrice(item.price)}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.description && item.description.length > 30 
                          ? `${item.description.substring(0, 30)}...` 
                          : item.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAddFeatured(item)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="p-4 flex justify-end bg-gray-50">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-green-500 hover:bg-green-600 rounded-lg"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
