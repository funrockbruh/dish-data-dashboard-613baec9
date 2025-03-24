
import { useState, useEffect } from "react";

export const ThemeTemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("template1");

  useEffect(() => {
    // Load selected template from localStorage
    const loadTheme = () => {
      try {
        const theme = JSON.parse(localStorage.getItem('theme') || '{}');
        if (theme.template) {
          setSelectedTemplate(theme.template);
        }
      } catch (error) {
        console.error("Error loading theme template:", error);
      }
    };
    
    loadTheme();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Save template selection to localStorage
    try {
      const currentTheme = JSON.parse(localStorage.getItem('theme') || '{}');
      localStorage.setItem('theme', JSON.stringify({
        ...currentTheme,
        template: templateId
      }));
    } catch (error) {
      console.error("Error saving theme template:", error);
    }
  };

  const templates = [
    { id: "template1", name: "Classic Menu" },
    { id: "template2", name: "Modern Grid" },
    { id: "template3", name: "Elegant List" }
  ];

  return (
    <div className="py-4">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Select Template</h3>
        <p className="text-gray-500 text-sm">Choose how your menu items are displayed</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div 
          className={`relative rounded-lg overflow-hidden border-2 cursor-pointer ${
            selectedTemplate === "template1" ? "border-blue-500" : "border-gray-200"
          }`}
          onClick={() => handleTemplateSelect("template1")}
        >
          <img 
            src="/lovable-uploads/a21e7b7a-0288-4bbf-917c-03d0f537cecf.png" 
            alt="Template 1" 
            className="w-full h-auto"
          />
          {selectedTemplate === "template1" && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Selected
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
