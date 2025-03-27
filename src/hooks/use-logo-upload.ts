
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useLogoUpload = () => {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const { toast } = useToast();

  const handleLogoChange = (file: File) => {
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (userId: string) => {
    if (!logo) return logoPreview;

    console.log('Uploading new logo file:', logo.name, logo.type, logo.size);
    
    try {
      const fileExt = logo.name.split('.').pop();
      const fileName = `logo.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('restaurant-logos')
        .upload(filePath, logo, {
          upsert: true,
          contentType: logo.type,
          cacheControl: '3600'
        });
        
      if (uploadError) {
        console.error('Logo upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('Logo upload successful:', uploadData);
      
      const timestamp = new Date().getTime();
      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(`${filePath}?t=${timestamp}`);
        
      console.log('Logo public URL:', publicUrl);
      return publicUrl;
    } catch (uploadErr) {
      console.error('Error in logo upload process:', uploadErr);
      toast({
        title: "Upload Error",
        description: "There was a problem uploading your logo image",
        variant: "destructive"
      });
      return logoPreview;
    }
  };

  return {
    logo,
    logoPreview,
    setLogoPreview,
    handleLogoChange,
    uploadLogo
  };
};
