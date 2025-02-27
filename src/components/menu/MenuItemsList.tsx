
import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AddMenuItemDialog } from "./AddMenuItemDialog";
import { MenuItemCard } from "./MenuItemCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string;
}

export const MenuItemsList = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profile, setProfile] = useState<{
    restaurant_name: string | null;
    owner_name: string | null;
    logo_url: string | null;
  }>({
    restaurant_name: "",
    owner_name: "",
    logo_url: null
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('restaurant_profiles')
      .select('restaurant_name, owner_name, logo_url')
      .eq('id', session.user.id)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('restaurant_id', session.user.id);

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', session.user.id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedItem(null);
    setIsDialogOpen(false);
  };

  const handleSuccess = () => {
    loadData();
    setHasUnsavedChanges(true);
  };

  const saveItems = async () => {
    try {
      setIsLoading(true);
      // No action needed here since items are already saved to Supabase
      // during add/edit operations. This is mainly for UX feedback.
      toast({
        title: "Success",
        description: "All menu items saved successfully"
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving items:', error);
      toast({
        title: "Error",
        description: "Failed to save menu items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items by both name and description
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="flex items-center gap-4 mb-8 p-4 bg-white border border-gray-200 rounded-2xl">
        {profile.logo_url && (
          <img 
            src={profile.logo_url} 
            alt="Restaurant logo" 
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
          />
        )}
        <div className="-space-y-1">
          <h1 className="text-2xl font-bold font-figtree">{profile.restaurant_name || "Restaurant"}</h1>
          <p className="text-gray-500 text-sm font-figtree">by {profile.owner_name || "Owner"}</p>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search menu items by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)} 
          className="aspect-square w-12 h-12 rounded-xl flex items-center justify-center transition-colors bg-white border-2 border-dashed border-gray-300 hover:border-gray-400"
        >
          <Plus className="h-6 w-6 text-gray-500" />
        </button>
      </div>

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
                onEdit={() => handleEdit(item)}
              />
            ))
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={saveItems}
          disabled={isLoading}
          className="px-6 py-6 rounded-xl"
        >
          {isLoading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>

      <AddMenuItemDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
        categories={categories}
        onSuccess={handleSuccess}
        editItem={selectedItem}
      />
    </div>
  );
};
