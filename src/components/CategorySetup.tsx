
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
import { Header } from "./categories/Header";
import { CategoryCard } from "./categories/CategoryCard";
import { AddCategoryDialog } from "./categories/AddCategoryDialog";

export const CategorySetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    image?: File;
    imagePreview?: string;
  }>({ name: "" });
  const [categories, setCategories] = useState<Array<{
    id?: string;
    name: string;
    image?: File;
    imagePreview?: string;
  }>>([]);
  const { toast } = useToast();

  const handleAddCategory = () => {
    setIsDialogOpen(true);
  };

  const handleNewCategoryImageChange = (file: File) => {
    setNewCategory(prev => {
      const updated = { ...prev, image: file };
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategory(current => ({
          ...current,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      return updated;
    });
  };

  const handleSaveNewCategory = () => {
    if (newCategory.name.trim()) {
      setCategories([...categories, newCategory]);
      setNewCategory({ name: "" }); // Reset form
      setIsDialogOpen(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      for (const category of categories) {
        if (!category.name.trim()) continue;

        let image_url = null;
        if (category.image) {
          const fileExt = category.image.name.split('.').pop();
          const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('menu-category-images')
            .upload(filePath, category.image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('menu-category-images')
            .getPublicUrl(filePath);
          
          image_url = publicUrl;
        }

        const { error: insertError } = await supabase
          .from('menu_categories')
          .insert({
            name: category.name,
            image_url,
            restaurant_id: session.user.id
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Categories saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Header />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <button
          onClick={handleAddCategory}
          className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Plus className="h-8 w-8 text-gray-400" />
        </button>

        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            name={category.name}
            imagePreview={category.imagePreview}
          />
        ))}
      </div>

      <AddCategoryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoryName={newCategory.name}
        onCategoryNameChange={(name) => setNewCategory(prev => ({ ...prev, name }))}
        imagePreview={newCategory.imagePreview}
        onImageChange={handleNewCategoryImageChange}
        onSave={handleSaveNewCategory}
      />
    </div>
  );
};
