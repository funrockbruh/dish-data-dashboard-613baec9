
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCodeSelect } from "./CountryCodeSelect";

interface WhatsAppInputProps {
  countryCode: string;
  value: string;
  onCountryCodeChange: (code: string) => void;
  onValueChange: (value: string) => void;
}

export const WhatsAppInput = ({
  countryCode,
  value,
  onCountryCodeChange,
  onValueChange
}: WhatsAppInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="whatsapp">WhatsApp:</Label>
      <div className="flex">
        <CountryCodeSelect value={countryCode} onChange={onCountryCodeChange} />
        <Input
          id="whatsapp"
          type="text"
          placeholder="Phone Number"
          className="rounded-l-none"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />
      </div>
    </div>
  );
};
