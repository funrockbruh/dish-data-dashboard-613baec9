
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

  const handleFileUpload = () => {
    // File upload logic to be implemented
    console.log(`Upload for ${type}`);
    setSelectedOption("image");
  };

  const handleColorSelect = () => {
    // Color selection logic to be implemented
    console.log(`Select color for ${type}`);
    setSelectedOption("color");
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        <Button 
          variant="outline" 
          className="min-w-24 bg-gray-100 rounded-md border border-gray-300"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files && target.files.length > 0) {
                handleFileUpload();
              }
            };
            input.click();
          }}
        >
          Select
        </Button>
      </div>
    </div>
  );
};
