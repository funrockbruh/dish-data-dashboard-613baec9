
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { countryCodes } from "@/components/social-media/CountryCodeSelect";

interface SocialLinks {
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  email: string;
}

export function useSocialMedia() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+961");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    whatsapp: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    email: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, [navigate]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        navigate('/');
        return;
      }
      
      // Fetch restaurant profile
      const { data: profileData, error } = await supabase
        .from('restaurant_profiles')
        .select('social_whatsapp, social_instagram, social_facebook, social_tiktok, social_email')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) throw error;
      
      if (profileData) {
        // Parse whatsapp to extract country code and number
        let whatsappNumber = profileData.social_whatsapp || "";
        let detectedCountryCode = "+961"; // Default
        
        // Check if whatsapp starts with a country code
        const countryCodeMatch = whatsappNumber.match(/^\+\d+/);
        if (countryCodeMatch) {
          // Try to find the matched country code in our list
          const matchedCode = countryCodes.find(cc => whatsappNumber.startsWith(cc.code));
          if (matchedCode) {
            detectedCountryCode = matchedCode.code;
            whatsappNumber = whatsappNumber.substring(matchedCode.code.length);
          }
        }
        
        setCountryCode(detectedCountryCode);
        
        setSocialLinks({
          whatsapp: whatsappNumber,
          instagram: profileData.social_instagram || "",
          facebook: profileData.social_facebook || "",
          tiktok: profileData.social_tiktok || "",
          email: profileData.social_email || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        navigate('/');
        return;
      }
      
      // Combine country code with whatsapp number before saving
      const fullWhatsappNumber = socialLinks.whatsapp ? `${countryCode}${socialLinks.whatsapp}` : "";
      
      const { error } = await supabase
        .from('restaurant_profiles')
        .update({
          social_whatsapp: fullWhatsappNumber,
          social_instagram: socialLinks.instagram,
          social_facebook: socialLinks.facebook,
          social_tiktok: socialLinks.tiktok,
          social_email: socialLinks.email,
        })
        .eq('id', session.session.user.id);
        
      if (error) throw error;
      
      toast.success("Social media links saved successfully");
    } catch (error) {
      console.error('Error saving social links:', error);
      toast.error("Failed to save social media links");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    loading,
    socialLinks,
    countryCode,
    setCountryCode,
    handleInputChange,
    handleSave
  };
}
