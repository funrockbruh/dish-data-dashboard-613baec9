
import { Check, Circle } from "lucide-react";

export type Feature = string | {
  label: string;
  selectable: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

interface PlanFeaturesProps {
  features: Feature[];
}

export const PlanFeatures = ({ features }: PlanFeaturesProps) => {
  const renderFeature = (feature: Feature, index: number) => {
    if (typeof feature === 'string') {
      return (
        <li key={index} className="flex items-center">
          <div className="p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span>{feature}</span>
        </li>
      );
    } else {
      return (
        <li key={index} className="flex items-center">
          {feature.selectable ? (
            <div 
              className={`p-1 rounded-full ${feature.selected ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'border border-gray-300'} mr-2 cursor-pointer`} 
              onClick={feature.onToggle}
            >
              {feature.selected ? <Check className="h-4 w-4 text-white" /> : <Circle className="h-4 w-4 text-gray-300" />}
            </div>
          ) : (
            <div className="p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
          <span>{feature.label}</span>
        </li>
      );
    }
  };

  return (
    <ul className="space-y-3 mb-8">
      {features.map((feature, i) => renderFeature(feature, i))}
    </ul>
  );
};
