
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AddMenuItemDialog } from "./AddMenuItemDialog";
import { RestaurantHeader } from "./RestaurantHeader";
import { MenuSearchBar } from "./MenuSearchBar";
import { MenuItemsDisplay } from "./MenuItemsDisplay";
import { useMenuData, MenuItem } from "@/hooks/use-menu-data";

export const MenuItemsList = () => {
  const { 
    items, 
    categories, 
    isLoading, 
    hasUnsavedChanges,
    setHasUnsavedChanges,
    profile, 
    refreshData 
  } = useMenuData();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedItem(null);
    setIsDialogOpen(false);
  };

  const handleSuccess = () => {
    refreshData();
  };

  const saveItems = async () => {
    try {
      setIsSaving(true);
      // No action needed here since items are already saved to Supabase
      // during add/edit operations. This is mainly for UX feedback.
      toast({
        title: "Success",
        description: "All menu items saved successfully"
      });
      setHasUnsavedChanges(false);
      
      // Navigate to featured items page after saving
      navigate('/featured');
    } catch (error) {
      console.error('Error saving items:', error);
      toast({
        title: "Error",
        description: "Failed to save menu items",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter items by both name and description
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <RestaurantHeader profile={profile} />

      <MenuSearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddClick={() => setIsDialogOpen(true)}
      />

      <MenuItemsDisplay 
        isLoading={isLoading}
        items={items}
        filteredItems={filteredItems}
        categories={categories}
        searchQuery={searchQuery}
        onEdit={handleEdit}
      />

      <div className="flex justify-end">
        <Button 
          onClick={saveItems}
          disabled={isLoading || isSaving}
          className="px-6 py-6 rounded-xl bg-[#23c55e]"
        >
          {isSaving ? "Saving..." : "Save & Continue"}
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
