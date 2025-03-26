
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { generateSubdomain } from "@/hooks/use-subdomain";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface RestaurantFormData {
  owner_name: string;
  restaurant_name: string;
  owner_number: string;
  owner_email: string;
  about: string;
  subdomain: string;
}

interface UseRestaurantFormProps {
  initialSetup?: boolean;
  returnPath?: string;
}

export const useRestaurantForm = ({ initialSetup = true, returnPath }: UseRestaurantFormProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RestaurantFormData>({
    owner_name: "",
    restaurant_name: "",
    owner_number: "",
    owner_email: "",
    about: "",
    subdomain: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
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
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      }
    };
    
    loadProfile();
  }, [navigate, toast]);

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
      checkSubdomainAvailability(newSubdomain);
    }
  };

  const handleSubdomainChange = (value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      subdomain: value
    }));

    if (value) {
      checkSubdomainAvailability(value);
    } else {
      setSubdomainError(null);
    }
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain) {
      setSubdomainError(null);
      return false;
    }
    
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
      setSubdomainError(null);
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
      const isSubdomainAvailable = await checkSubdomainAvailability(formData.subdomain);
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
      
      if (initialSetup) {
        navigate('/categories');
      } else if (returnPath) {
        navigate(returnPath);
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

  return {
    formData,
    isLoading,
    logoPreview,
    subdomainError,
    handleLogoChange,
    handleFormChange,
    handleRestaurantNameChange,
    handleSubdomainChange,
    setSubdomainError,
    handleSubmit
  };
};
