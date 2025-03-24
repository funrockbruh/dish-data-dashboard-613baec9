
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Instagram, Facebook, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { TikTokIcon } from "@/components/icons/TikTokIcon";

const SocialMedia = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    whatsapp: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    email: "",
  });

  useEffect(() => {
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
          .select('whatsapp, instagram, facebook, tiktok, email')
          .eq('id', session.session.user.id)
          .single();
          
        if (error) throw error;
        
        if (profileData) {
          setSocialLinks({
            whatsapp: profileData.whatsapp || "",
            instagram: profileData.instagram || "",
            facebook: profileData.facebook || "",
            tiktok: profileData.tiktok || "",
            email: profileData.email || "",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        navigate('/');
        return;
      }
      
      const { error } = await supabase
        .from('restaurant_profiles')
        .update({
          whatsapp: socialLinks.whatsapp,
          instagram: socialLinks.instagram,
          facebook: socialLinks.facebook,
          tiktok: socialLinks.tiktok,
          email: socialLinks.email,
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

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Social Media Links</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp:</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                  <Phone className="h-4 w-4 text-gray-500" />
                  +961
                </span>
                <Input
                  id="whatsapp"
                  type="text"
                  placeholder="Phone Number"
                  className="rounded-l-none"
                  value={socialLinks.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                />
              </div>
            </div>
            
            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram:</Label>
              <div className="flex items-center relative">
                <Input
                  id="instagram"
                  type="text"
                  placeholder="Instagram link"
                  value={socialLinks.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="pl-10"
                />
                <Instagram className="h-4 w-4 text-gray-500 absolute left-3" />
              </div>
            </div>
            
            {/* Facebook */}
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook:</Label>
              <div className="flex items-center relative">
                <Input
                  id="facebook"
                  type="text"
                  placeholder="Facebook link"
                  value={socialLinks.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  className="pl-10"
                />
                <Facebook className="h-4 w-4 text-gray-500 absolute left-3" />
              </div>
            </div>
            
            {/* TikTok */}
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok:</Label>
              <div className="flex items-center relative">
                <Input
                  id="tiktok"
                  type="text"
                  placeholder="TikTok link"
                  value={socialLinks.tiktok}
                  onChange={(e) => handleInputChange('tiktok', e.target.value)}
                  className="pl-10"
                />
                <TikTokIcon className="h-4 w-4 text-gray-500 absolute left-3" />
              </div>
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email:</Label>
              <div className="flex items-center relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={socialLinks.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                />
                <Mail className="h-4 w-4 text-gray-500 absolute left-3" />
              </div>
            </div>
            
            <Button 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleSave}
              disabled={loading}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
