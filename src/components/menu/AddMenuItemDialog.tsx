import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface AddMenuItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  editItem?: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    category_id: string;
  } | null;
}

export const AddMenuItemDialog = ({
  isOpen,
  onOpenChange,
  categories,
  onSuccess,
  editItem
}: AddMenuItemDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editItem?.name || "",
    description: editItem?.description || "",
    price: editItem?.price ? (editItem.price / 100).toString() : "",
    categoryId: editItem?.category_id || (categories.length > 0 ? categories[0].id : ""),
    image: null as File | null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        description: editItem.description,
        price: (editItem.price / 100).toString(),
        categoryId: editItem.category_id,
        image: null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        image: null,
      });
    }
  }, [editItem, categories]);

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return false;
    }
    if (isNaN(Number(formData.price))) {
      toast({
        title: "Error",
        description: "Price must be a number.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'menu-item');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!editItem) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', editItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      let image_url = editItem?.image_url || null;
      if (formData.image) {
        image_url = await handleImageUpload(formData.image);
      }

      const price = parseFloat(formData.price);
      const priceInCents = Math.round(price * 100);

      if (editItem) {
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({
            name: formData.name,
            description: formData.description,
            price: priceInCents,
            category_id: formData.categoryId,
            ...(image_url && { image_url })
          })
          .eq('id', editItem.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Menu item updated successfully"
        });
      } else {
        const { error: insertError } = await supabase
          .from('menu_items')
          .insert({
            name: formData.name,
            description: formData.description,
            price: priceInCents,
            category_id: formData.categoryId,
            image_url,
            restaurant_id: session.user.id
          });

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Menu item added successfully"
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error with menu item:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${editItem ? 'update' : 'add'} menu item`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold font-inter">
              {editItem ? 'Edit Item' : 'Add Item'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Item name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Item description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              placeholder="Item price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" defaultValue={formData.categoryId} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, image: file });
                }
              }}
            />
          </div>
        </div>
        
        <div className="space-y-3 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white h-12 font-inter rounded-xl"
          >
            {isLoading ? (editItem ? "Updating..." : "Adding...") : (
              <>
                {editItem ? <Pencil className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {editItem ? 'Update Item' : 'Add Item'}
              </>
            )}
          </Button>

          {editItem && (
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="destructive"
              className="w-full h-12 font-inter rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Item
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
