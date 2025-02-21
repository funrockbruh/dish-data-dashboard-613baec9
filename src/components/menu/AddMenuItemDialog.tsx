
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AddMenuItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string; }>;
  onSuccess: () => void;
}

export const AddMenuItemDialog = ({
  isOpen,
  onOpenChange,
  categories,
  onSuccess
}: AddMenuItemDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: categories[0]?.id || "",
    image: null as File | null,
    imagePreview: null as string | null
  });
  const { toast } = useToast();

  const handleImageChange = (file: File) => {
    setFormData(prev => {
      const updated = { ...prev, image: file };

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(current => ({
          ...current,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      let image_url = null;
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('menu-item-images')
          .upload(filePath, formData.image);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-item-images')
          .getPublicUrl(filePath);
        
        image_url = publicUrl;
      }

      const priceInCents = Math.round(parseFloat(formData.price) * 100);

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
      
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: categories[0]?.id || "",
        image: null,
        imagePreview: null
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add menu item",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold font-inter">
              Add menu item
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="font-inter">Image</Label>
            <div 
              onClick={() => document.getElementById('menu-item-image')?.click()}
              className="relative w-full h-48 rounded-xl flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-50 transition-colors"
            >
              {formData.imagePreview ? (
                <img 
                  src={formData.imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm font-inter">Click to upload image</span>
                </div>
              )}
            </div>
            <Input
              id="menu-item-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageChange(file);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Category</Label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Item name"
              className="font-inter"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Description (optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your item..."
              className="font-inter"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-inter">Price</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              className="font-inter"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white h-12 font-inter rounded-xl"
          >
            {isLoading ? "Adding..." : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
