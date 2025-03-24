
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// Country codes for the dropdown
export const countryCodes = [
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

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CountryCodeSelect = ({ value, onChange }: CountryCodeSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="rounded-r-none w-[120px] bg-gray-100 border-r-0">
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
  );
};
