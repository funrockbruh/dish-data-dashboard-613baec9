
import { useState } from "react";

export const ThemeTemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("template1");

  const templates = [
    { id: "template1", name: "Classic Menu", description: "Traditional menu layout with items in a list" },
    { id: "template2", name: "Modern Grid", description: "Items displayed in a responsive grid" },
    { id: "template3", name: "Elegant List", description: "Minimalist design with focus on readability" },
    { id: "template4", name: "Card View", description: "Each item displayed as a card with details" },
    { id: "template5", name: "Compact Layout", description: "Space-efficient design for many items" }
  ];

  return (
    <div className="py-4">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Select Template</h3>
        <p className="text-gray-500 text-sm">Choose how your menu items are displayed</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        {templates.map(template => (
          <div 
            key={template.id}
            className={`relative rounded-lg overflow-hidden border-2 p-4 cursor-pointer ${
              selectedTemplate === template.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex flex-col">
              <h4 className="font-medium text-lg">{template.name}</h4>
              <p className="text-gray-500 text-sm">{template.description}</p>
            </div>
            
            {selectedTemplate === template.id && (
              <div className="absolute top-4 right-4">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Selected
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
