
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface LogoUploaderProps {
  logoPreview: string;
  onLogoChange: (file: File) => void;
}

export const LogoUploader = ({ logoPreview, onLogoChange }: LogoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoChange(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div 
        className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4 relative cursor-pointer group" 
        onClick={handleUploadClick}
      >
        {logoPreview ? (
          <>
            <div className="w-full h-full">
              <ImageWithSkeleton 
                src={logoPreview} 
                alt="Restaurant logo" 
                className="w-full h-full object-cover"
                fallbackClassName="rounded-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pencil className="w-6 h-6 text-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <span className="text-gray-400">Click to upload</span>
          </div>
        )}
      </div>
      <Input 
        ref={fileInputRef} 
        id="logo" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />
    </div>
  );
};
