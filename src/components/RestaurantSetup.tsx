
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { LogoUploader } from "./restaurant/LogoUploader";
import { SubdomainInput } from "./restaurant/SubdomainInput";
import { RestaurantInfoForm } from "./restaurant/RestaurantInfoForm";
import { generateSubdomain } from "@/hooks/use-subdomain";

export const RestaurantSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isInitialSetup, setIsInitialSetup] = useState(true);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    owner_name: "",
    restaurant_name: "",
    owner_number: "",
    owner_email: "",
    about: "",
    subdomain: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/');
        return;
      }
      
      const { data, error } = await supabase
        .from('restaurant_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (data && !error) {
        setFormData({
          owner_name: data.owner_name || "",
          restaurant_name: data.restaurant_name || "",
          owner_number: data.owner_number || "",
          owner_email: data.owner_email || "",
          about: data.about || "",
          subdomain: data.subdomain || ""
        });
        
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
        
        if (location.state?.from === 'settings') {
          setIsInitialSetup(false);
        } else {
          const { count } = await supabase
            .from('menu_categories')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', session.user.id);
            
          setIsInitialSetup(count === 0);
        }
      }
    };
    
    loadProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.state]);

  const handleLogoChange = (file: File) => {
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [field]: value
    }));
  };

  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newSubdomain = generateSubdomain(value);
    
    setFormData(prevFormData => ({
      ...prevFormData,
      restaurant_name: value,
      subdomain: prevFormData.subdomain === generateSubdomain(prevFormData.restaurant_name) 
        ? newSubdomain 
        : prevFormData.subdomain
    }));
    
    if (newSubdomain && formData.subdomain === generateSubdomain(formData.restaurant_name)) {
      checkSubdomainBeforeSubmit(newSubdomain);
    }
  };

  const handleSubdomainChange = (value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      subdomain: value
    }));
  };

  const checkSubdomainBeforeSubmit = async (subdomain: string) => {
    if (!subdomain) return false;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");
      
      const { data: existingSubdomain } = await supabase
        .from('restaurant_profiles')
        .select('id')
        .eq('subdomain', subdomain)
        .neq('id', session.user.id)
        .maybeSingle();
        
      if (existingSubdomain) {
        setSubdomainError("This subdomain is already taken. Please choose another one.");
        return false;
      }
      return true;
    } catch (error) {
      console.error('Subdomain check error:', error);
      toast({
        title: "Error",
        description: "Failed to check subdomain availability",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check subdomain one more time before submission
    if (formData.subdomain) {
      const isSubdomainAvailable = await checkSubdomainBeforeSubmit(formData.subdomain);
      if (!isSubdomainAvailable) return;
    }

    setIsLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error("Authentication error");
      if (!session?.user) throw new Error("Not authenticated");

      let logo_url = logoPreview;
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const filePath = `${session.user.id}/logo.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('restaurant-logos')
          .upload(filePath, logo, {
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-logos')
          .getPublicUrl(filePath);
          
        logo_url = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('restaurant_profiles')
        .upsert({
          id: session.user.id,
          ...formData,
          logo_url
        });
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully"
      });
      
      if (isInitialSetup) {
        navigate('/categories');
      } else {
        navigate('/settings');
      }
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

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" className="rounded-full mr-2" onClick={handleBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-2xl font-bold">Restaurant Profile Setup</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <LogoUploader 
          logoPreview={logoPreview} 
          onLogoChange={handleLogoChange} 
        />

        <RestaurantInfoForm 
          formData={formData} 
          onFormChange={handleFormChange}
          onRestaurantNameChange={handleRestaurantNameChange}
        />

        <SubdomainInput 
          subdomain={formData.subdomain}
          onSubdomainChange={handleSubdomainChange}
          error={subdomainError}
          onErrorChange={setSubdomainError}
        />

        <Button 
          type="submit" 
          disabled={isLoading || !!subdomainError} 
          className="w-full bg-green-600 hover:bg-green-500"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Card>
  );
};
