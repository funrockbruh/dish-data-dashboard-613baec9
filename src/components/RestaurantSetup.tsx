import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
export const RestaurantSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    owner_name: "",
    restaurant_name: "",
    owner_number: "",
    owner_email: "",
    about: ""
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('restaurant_profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (data && !error) {
        setFormData({
          owner_name: data.owner_name || "",
          restaurant_name: data.restaurant_name || "",
          owner_number: data.owner_number || "",
          owner_email: data.owner_email || "",
          about: data.about || ""
        });
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    };
    loadProfile();

    // Set up auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        data: {
          session
        },
        error: sessionError
      } = await supabase.auth.getSession();
      if (sessionError) throw new Error("Authentication error");
      if (!session?.user) throw new Error("Not authenticated");
      let logo_url = logoPreview;
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const filePath = `${session.user.id}/logo.${fileExt}`;
        const {
          error: uploadError
        } = await supabase.storage.from('restaurant-logos').upload(filePath, logo, {
          upsert: true,
          cacheControl: '3600'
        });
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from('restaurant-logos').getPublicUrl(filePath);
        logo_url = publicUrl;
      }
      const {
        error: updateError
      } = await supabase.from('restaurant_profiles').upsert({
        id: session.user.id,
        ...formData,
        logo_url
      });
      if (updateError) throw updateError;
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully"
      });

      // Navigate to categories setup after successful save
      navigate('/categories');
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Card className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Restaurant Profile Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4 relative cursor-pointer group" onClick={handleUploadClick}>
            {logoPreview ? <>
                <img src={logoPreview} alt="Restaurant logo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Pencil className="w-6 h-6 text-white" />
                </div>
              </> : <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <span className="text-gray-400">Click to upload</span>
              </div>}
          </div>
          <Input ref={fileInputRef} id="logo" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner_name">Owner Name</Label>
            <Input id="owner_name" value={formData.owner_name} onChange={e => setFormData(prev => ({
            ...prev,
            owner_name: e.target.value
          }))} placeholder="Enter owner name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurant_name">Restaurant Name</Label>
            <Input id="restaurant_name" value={formData.restaurant_name} onChange={e => setFormData(prev => ({
            ...prev,
            restaurant_name: e.target.value
          }))} placeholder="Enter restaurant name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner_number">Phone Number</Label>
            <Input id="owner_number" value={formData.owner_number} onChange={e => setFormData(prev => ({
            ...prev,
            owner_number: e.target.value
          }))} placeholder="Enter phone number" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner_email">Email</Label>
            <Input id="owner_email" type="email" value={formData.owner_email} onChange={e => setFormData(prev => ({
            ...prev,
            owner_email: e.target.value
          }))} placeholder="Enter email" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="about">About Restaurant</Label>
          <Textarea id="about" value={formData.about} onChange={e => setFormData(prev => ({
          ...prev,
          about: e.target.value
        }))} placeholder="Tell us about your restaurant" className="h-32" />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-500">
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Card>;
};