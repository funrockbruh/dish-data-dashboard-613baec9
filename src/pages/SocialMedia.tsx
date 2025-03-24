
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Instagram, Facebook, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Country codes for the dropdown
const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+33", country: "France" },
  { code: "+44", country: "UK" },
  { code: "+49", country: "Germany" },
  { code: "+61", country: "Australia" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+91", country: "India" },
  { code: "+961", country: "Lebanon" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+20", country: "Egypt" },
  { code: "+212", country: "Morocco" },
  { code: "+216", country: "Tunisia" },
  { code: "+970", country: "Palestine" },
  { code: "+962", country: "Jordan" },
  { code: "+963", country: "Syria" },
];

const SocialMedia = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+961");
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
          // Parse whatsapp to extract country code and number
          let whatsappNumber = profileData.whatsapp || "";
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
      
      // Combine country code with whatsapp number before saving
      const fullWhatsappNumber = socialLinks.whatsapp ? `${countryCode}${socialLinks.whatsapp}` : "";
      
      const { error } = await supabase
        .from('restaurant_profiles')
        .update({
          whatsapp: fullWhatsappNumber,
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
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="rounded-r-none w-[120px]">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.code} {country.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
