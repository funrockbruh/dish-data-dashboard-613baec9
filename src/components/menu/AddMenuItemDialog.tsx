import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

interface AddMenuItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
  editItem?: {
    id?: string;
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
  const [formData, setFormData] = useState({
    name: editItem?.name || "",
    description: editItem?.description || "",
    price: editItem?.price ? (editItem.price / 100).toString() : "",
    category_id: editItem?.category_id || categories[0]?.id || "",
    image: null as File | null,
    imagePreview: editItem?.image_url || null as string | null,
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        description: editItem.description,
        price: (editItem.price / 100).toString(),
        category_id: editItem.category_id,
        image: null,
        imagePreview: editItem.image_url || null,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: categories[0]?.id || "",
        image: null,
        imagePreview: null,
      });
    }
  }, [editItem, categories]);

  const handleImageChange = async (file: File) => {
    setFormData(prev => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(current => ({
        ...current,
        imagePreview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.price || !formData.category_id) {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive"
        });
        return;
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid price.",
          variant: "destructive"
        });
        return;
      }

      setIsOptimizing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      let image_url = editItem?.image_url || null;

      if (formData.image) {
        const fileExt = 'jpg'; // Always jpg after optimization
        const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('menu-item-images')
          .upload(filePath, formData.image, {
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-item-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      if (editItem?.id) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: formData.name,
            description: formData.description,
            price: Math.round(price * 100),
            category_id: formData.category_id,
            image_url: image_url,
          })
          .eq('id', editItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Menu item updated successfully"
        });
      } else {
        // Add new item
        const { error } = await supabase
          .from('menu_items')
          .insert({
            name: formData.name,
            description: formData.description,
            price: Math.round(price * 100),
            category_id: formData.category_id,
            image_url: image_url,
            restaurant_id: session.user.id
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Menu item added successfully"
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error during submit:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDelete = async () => {
    if (!editItem?.id) return;

    try {
      setIsOptimizing(true);
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
      console.error('Error during delete:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold font-inter">
              {editItem ? 'Edit menu item' : 'Add menu item'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="font-inter">Image</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-48 rounded-xl flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-50 transition-colors"
            >
              {formData.imagePreview ? (
                <div className="relative w-full h-full">
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm font-inter">Click to upload image</span>
                </div>
              )}
              {isOptimizing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <div className="text-white">Optimizing...</div>
                </div>
              )}
            </div>
            <Input
              id="menu-item-image"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageChange(file);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-item-name" className="font-inter">Name</Label>
            <Input
              id="menu-item-name"
              placeholder="Menu item name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-item-description" className="font-inter">Description</Label>
            <Textarea
              id="menu-item-description"
              placeholder="Menu item description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-item-price" className="font-inter">Price</Label>
            <Input
              id="menu-item-price"
              placeholder="Menu item price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-item-category" className="font-inter">Category</Label>
            <select
              id="menu-item-category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            {editItem?.id && (
              <Button variant="destructive" onClick={handleDelete} disabled={isOptimizing}>
                {isOptimizing ? (
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={isOptimizing}>
              {isOptimizing ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
