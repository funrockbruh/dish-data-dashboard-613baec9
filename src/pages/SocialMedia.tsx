
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Mail } from "lucide-react";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { SocialMediaLayout } from "@/components/social-media/SocialMediaLayout";
import { WhatsAppInput } from "@/components/social-media/WhatsAppInput";
import { SocialMediaInput } from "@/components/social-media/SocialMediaInput";
import { useSocialMedia } from "@/hooks/use-social-media";

const SocialMedia = () => {
  const {
    loading,
    socialLinks,
    countryCode,
    setCountryCode,
    handleInputChange,
    handleSave
  } = useSocialMedia();

  return (
    <SocialMediaLayout>
      <div className="space-y-6">
        {/* WhatsApp */}
        <WhatsAppInput
          countryCode={countryCode}
          value={socialLinks.whatsapp}
          onCountryCodeChange={setCountryCode}
          onValueChange={(value) => handleInputChange('whatsapp', value)}
        />
        
        {/* Instagram */}
        <SocialMediaInput
          id="instagram"
          label="Instagram"
          value={socialLinks.instagram}
          onChange={(value) => handleInputChange('instagram', value)}
          placeholder="Instagram link"
          icon={<Instagram className="h-4 w-4" />}
        />
        
        {/* Facebook */}
        <SocialMediaInput
          id="facebook"
          label="Facebook"
          value={socialLinks.facebook}
          onChange={(value) => handleInputChange('facebook', value)}
          placeholder="Facebook link"
          icon={<Facebook className="h-4 w-4" />}
        />
        
        {/* TikTok */}
        <SocialMediaInput
          id="tiktok"
          label="TikTok"
          value={socialLinks.tiktok}
          onChange={(value) => handleInputChange('tiktok', value)}
          placeholder="TikTok link"
          icon={<TikTokIcon className="h-4 w-4" />}
        />
        
        {/* Email */}
        <SocialMediaInput
          id="email"
          label="Email"
          value={socialLinks.email}
          onChange={(value) => handleInputChange('email', value)}
          placeholder="email@example.com"
          icon={<Mail className="h-4 w-4" />}
          type="email"
        />
        
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-lg"
          onClick={handleSave}
          disabled={loading}
        >
          Save
        </Button>
      </div>
    </SocialMediaLayout>
  );
};

export default SocialMedia;
