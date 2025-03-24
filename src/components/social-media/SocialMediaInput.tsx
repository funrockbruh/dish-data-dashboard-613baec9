
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface SocialMediaInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: ReactNode;
  type?: string;
}

export const SocialMediaInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text"
}: SocialMediaInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}:</Label>
      <div className="flex items-center relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
        <div className="h-4 w-4 text-gray-500 absolute left-3">
          {icon}
        </div>
      </div>
    </div>
  );
};
