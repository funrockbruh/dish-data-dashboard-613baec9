
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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

export const useRestaurantProfileManagement = () => {
  const [formData, setFormData] = useState<RestaurantFormData>({
    owner_name: "",
    restaurant_name: "",
    owner_number: "",
    owner_email: "",
    about: "",
    subdomain: "",
    country_code: "+961"
  });
  const { toast } = useToast();
  const navigate = useNavigate();

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
        let countryCode = "+961";
        let phoneNumber = data.owner_number || "";
        
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
        
        return data.logo_url || null;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
    return null;
  };

  const saveProfile = async (
    logoUrl: string, 
    userId: string, 
    subdomainValid: boolean
  ) => {
    if (formData.subdomain && !subdomainValid) return false;
    
    try {
      const fullPhoneNumber = formData.country_code + formData.owner_number;

      const { error: updateError } = await supabase
        .from('restaurant_profiles')
        .upsert({
          id: userId,
          owner_name: formData.owner_name,
          restaurant_name: formData.restaurant_name,
          owner_number: fullPhoneNumber,
          owner_email: formData.owner_email,
          about: formData.about,
          subdomain: formData.subdomain,
          logo_url: logoUrl
        });
        
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }
      
      console.log('Profile updated successfully with logo_url:', logoUrl);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [field]: value
    }));
  };

  return {
    formData,
    setFormData,
    loadProfile,
    saveProfile,
    handleFormChange
  };
};
