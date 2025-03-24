
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ThemeColorSelectorProps {
  title: string;
  description: string;
  type: "background" | "popup";
}

export const ThemeColorSelector = ({
  title,
  description,
  type
}: ThemeColorSelectorProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setSelectedOption("image");
        console.log(`Image selected for ${type}:`, e.target.result);
        
        // Update theme in localStorage to persist selection
        const currentTheme = JSON.parse(localStorage.getItem('theme') || '{}');
        const updatedTheme = {
          ...currentTheme,
          [`${type}Image`]: e.target.result
        };
        localStorage.setItem('theme', JSON.stringify(updatedTheme));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedOption("color");
    console.log(`Color selected for ${type}:`, color);
    
    // Update theme in localStorage to persist selection
    const currentTheme = JSON.parse(localStorage.getItem('theme') || '{}');
    const updatedTheme = {
      ...currentTheme,
      [`${type}Color`]: color
    };
    localStorage.setItem('theme', JSON.stringify(updatedTheme));
  };

  // Predefined color options
  const colorOptions = [
    "#8E9196", // Neutral Gray
    "#9b87f5", // Primary Purple
    "#F97316", // Bright Orange
    "#0EA5E9", // Ocean Blue
    "#D946EF", // Magenta Pink
    "#FEC6A1", // Soft Orange
    "#E5DEFF", // Soft Purple
    "#FFFFFF", // Pure White
    "#000000", // Black
  ];

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="min-w-24 bg-gray-100 rounded-md border border-gray-300"
            >
              Select
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Upload Image</h4>
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files && target.files.length > 0) {
                        handleFileUpload(target.files[0]);
                      }
                    };
                    input.click();
                  }}
                >
                  Choose Image
                </Button>
                {selectedOption === "image" && selectedImage && (
                  <div className="mt-2">
                    <div className="relative w-full h-24 rounded overflow-hidden">
                      <img 
                        src={selectedImage} 
                        alt="Selected background" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Select Color</h4>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-full h-8 rounded-md border ${
                        selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    ref={colorInputRef}
                    className="sr-only"
                    value={selectedColor || "#000000"}
                    onChange={(e) => handleColorSelect(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => colorInputRef.current?.click()}
                  >
                    Custom Color
                  </Button>
                  {selectedColor && (
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: selectedColor }}
                    />
                  )}
                </div>
                
                {selectedOption === "color" && selectedColor && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm">{selectedColor}</span>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
