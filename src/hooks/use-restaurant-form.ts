
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
  country_code: string;
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
    subdomain: "",
    country_code: "+961"
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
          // Extract country code from owner_number if available
          let countryCode = "+961";
          let phoneNumber = data.owner_number || "";
          
          // Check if owner_number starts with a country code
          if (phoneNumber.startsWith('+')) {
            const match = phoneNumber.match(/^\+\d+/);
            if (match) {
              countryCode = match[0];
              phoneNumber = phoneNumber.substring(match[0].length);
            }
          }
          
          setFormData({
            owner_name: data.owner_name || "",
            restaurant_name: data.restaurant_name || "",
            owner_number: phoneNumber,
            owner_email: data.owner_email || "",
            about: data.about || "",
            subdomain: data.subdomain || "",
            country_code: countryCode
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

      // Log the current state of logo and logoPreview
      console.log('Current logo file:', logo);
      console.log('Current logo preview:', logoPreview);
      
      let logo_url = logoPreview;
      
      // Only upload new logo if it has been changed
      if (logo) {
        console.log('Uploading new logo file:', logo.name, logo.type, logo.size);
        
        const fileExt = logo.name.split('.').pop();
        const filePath = `${session.user.id}/logo.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('restaurant-logos')
          .upload(filePath, logo, {
            upsert: true,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        
        console.log('Logo upload successful:', uploadData);
        
        const { data: { publicUrl } } = supabase.storage
          .from('restaurant-logos')
          .getPublicUrl(filePath);
          
        console.log('Logo public URL:', publicUrl);
        logo_url = publicUrl;
      }

      // Combine country code with phone number
      const fullPhoneNumber = formData.country_code + formData.owner_number;

      const { error: updateError } = await supabase
        .from('restaurant_profiles')
        .upsert({
          id: session.user.id,
          owner_name: formData.owner_name,
          restaurant_name: formData.restaurant_name,
          owner_number: fullPhoneNumber,
          owner_email: formData.owner_email,
          about: formData.about,
          subdomain: formData.subdomain,
          logo_url
        });
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      
      console.log('Profile updated successfully with logo_url:', logo_url);
      
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully"
      });
      
      if (initialSetup) {
        navigate('/categories');
      } else if (returnPath) {
        navigate(`/${returnPath}`);
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
