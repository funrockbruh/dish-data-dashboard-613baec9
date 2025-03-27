
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface LogoUploaderProps {
  logoPreview: string;
  onLogoChange: (file: File) => void;
}

export const LogoUploader = ({ logoPreview, onLogoChange }: LogoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeImage = async (file: File): Promise<File> => {
    setIsOptimizing(true);
    try {
      return await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          // Set max dimensions for optimization (512x512 is a good balance)
          const MAX_WIDTH = 512;
          const MAX_HEIGHT = 512;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with quality setting of 0.85 for JPEG
          canvas.toBlob((blob) => {
            if (blob) {
              // Create new file from blob
              const optimizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file); // Fallback to original if optimization fails
            }
          }, "image/jpeg", 0.85);
        };
        
        img.onerror = () => {
          console.error("Image loading failed during optimization");
          resolve(file); // Fallback to original if loading fails
        };
        
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error("Error optimizing image:", error);
      return file; // Return original file on error
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verify it's an image file
      if (!file.type.startsWith('image/')) {
        console.error('Selected file is not an image');
        return;
      }
      
      const optimizedFile = await optimizeImage(file);
      onLogoChange(optimizedFile);
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
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Pencil className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            {isOptimizing ? (
              <span className="text-gray-400">Optimizing...</span>
            ) : (
              <span className="text-gray-400">Click to upload</span>
            )}
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
