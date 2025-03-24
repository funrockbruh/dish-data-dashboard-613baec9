import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "./categories/Header";
import { CategoryCard } from "./categories/CategoryCard";
import { AddCategoryDialog } from "./categories/AddCategoryDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CategorySetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isFromSettings = location.state?.from === 'settings';
  const [newCategory, setNewCategory] = useState<{
    name: string;
    image?: File;
    imagePreview?: string;
  }>({
    name: ""
  });
  const [categories, setCategories] = useState<Array<{
    id?: string;
    name: string;
    image?: File;
    imagePreview?: string;
    image_url?: string;
  }>>([]);
  const {
    toast
  } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const {
        data,
        error
      } = await supabase.from('menu_categories').select('*').eq('restaurant_id', session.user.id);
      if (error) {
        console.error('Error loading categories:', error);
        return;
      }
      if (data) {
        const formattedCategories = data.map(category => ({
          id: category.id,
          name: category.name,
          imagePreview: category.image_url,
          image_url: category.image_url
        }));
        setCategories(formattedCategories);
      }
    };
    loadCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingIndex(null);
    setNewCategory({
      name: ""
    });
    setIsDialogOpen(true);
  };

  const handleNewCategoryImageChange = (file: File) => {
    setNewCategory(prev => {
      const updated = {
        ...prev,
        image: file
      };
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

  const handleEditCategory = (index: number) => {
    const categoryToEdit = categories[index];
    setEditingIndex(index);
    setNewCategory({
      name: categoryToEdit.name,
      imagePreview: categoryToEdit.imagePreview
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (editingIndex !== null) {
      const categoryToDelete = categories[editingIndex];
      if (categoryToDelete.id) {
        const {
          error
        } = await supabase.from('menu_categories').delete().eq('id', categoryToDelete.id);
        if (error) {
          toast({
            title: "Error",
            description: "Failed to delete category",
            variant: "destructive"
          });
          return;
        }
      }
      const updatedCategories = categories.filter((_, index) => index !== editingIndex);
      setCategories(updatedCategories);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    }
  };

  const handleSaveNewCategory = () => {
    if (newCategory.name.trim()) {
      if (editingIndex !== null) {
        const updatedCategories = [...categories];
        updatedCategories[editingIndex] = {
          ...updatedCategories[editingIndex],
          ...newCategory
        };
        setCategories(updatedCategories);
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        setCategories([...categories, newCategory]);
        toast({
          title: "Success",
          description: "Category added successfully"
        });
      }
      setNewCategory({
        name: ""
      });
      setIsDialogOpen(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data: existingItems } = await supabase
        .from('menu_items')
        .select('id')
        .eq('restaurant_id', session.user.id);

      const { data: existingCategories } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('restaurant_id', session.user.id);
      const existingCategoryIds = new Set(existingCategories?.map(cat => cat.id) || []);
      const updatedCategoryIds = new Set<string>();

      for (const category of categories) {
        if (!category.name.trim()) continue;
        let image_url = category.image_url;
        if (category.image) {
          const fileExt = 'jpg';
          const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;
          const {
            error: uploadError
          } = await supabase.storage.from('menu-category-images').upload(filePath, category.image);
          if (uploadError) throw uploadError;
          const {
            data: {
              publicUrl
            }
          } = supabase.storage.from('menu-category-images').getPublicUrl(filePath);
          image_url = publicUrl;
        }
        if (category.id) {
          const {
            error: updateError,
            data: updatedCategory
          } = await supabase.from('menu_categories').update({
            name: category.name,
            image_url
          }).eq('id', category.id).select('id').single();
          if (updateError) throw updateError;
          if (updatedCategory) updatedCategoryIds.add(updatedCategory.id);
        } else {
          const {
            error: insertError,
            data: newCategory
          } = await supabase.from('menu_categories').insert({
            name: category.name,
            image_url,
            restaurant_id: session.user.id
          }).select('id').single();
          if (insertError) throw insertError;
          if (newCategory) updatedCategoryIds.add(newCategory.id);
        }
      }

      for (const catId of existingCategoryIds) {
        if (!updatedCategoryIds.has(catId)) {
          const {
            data: itemsUsingCategory,
            error: countError
          } = await supabase.from('menu_items').select('id').eq('category_id', catId);
          if (countError) throw countError;

          if (!itemsUsingCategory || itemsUsingCategory.length === 0) {
            const {
              error: deleteError
            } = await supabase.from('menu_categories').delete().eq('id', catId);
            if (deleteError) throw deleteError;
          } else {
            updatedCategoryIds.add(catId);
          }
        }
      }

      if (isFromSettings) {
        navigate('/settings');
      } else {
        navigate('/menu');
      }

      toast({
        title: "Success",
        description: "Categories saved successfully"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Header />

      <Card className="p-6 bg-white border border-gray-200 rounded-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button onClick={handleAddCategory} className="aspect-square rounded-2xl flex items-center justify-center transition-colors bg-white border-2 border-dashed border-gray-300 hover:border-gray-400">
            <Plus className="h-10 w-10 text-gray-400" />
          </button>

          {categories.map((category, index) => <CategoryCard key={index} name={category.name} imagePreview={category.imagePreview} onEdit={() => handleEditCategory(index)} />)}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="px-6 py-6 rounded-xl bg-[#23c55e]">
          {isLoading ? "Saving..." : isFromSettings ? "Save" : "Save & Continue"}
        </Button>
      </div>

      <AddCategoryDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} categoryName={newCategory.name} onCategoryNameChange={name => setNewCategory(prev => ({
      ...prev,
      name
    }))} imagePreview={newCategory.imagePreview} onImageChange={handleNewCategoryImageChange} onSave={handleSaveNewCategory} onDelete={editingIndex !== null ? handleDeleteCategory : undefined} isEditing={editingIndex !== null} />
    </div>;
};
