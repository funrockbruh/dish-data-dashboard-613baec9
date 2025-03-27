import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCodeSelect } from "@/components/social-media/CountryCodeSelect";
interface PhoneNumberInputProps {
  label: string;
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (value: string) => void;
  required?: boolean;
}
export const PhoneNumberInput = ({
  label,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  required = false
}: PhoneNumberInputProps) => {
  return <div className="space-y-2">
      <Label htmlFor="phone_number">{label}</Label>
      <div className="flex">
        <CountryCodeSelect value={countryCode} onChange={onCountryCodeChange} />
        <Input id="phone_number" type="text" value={phoneNumber} onChange={e => onPhoneNumberChange(e.target.value)} placeholder="Phone Number" required={required} className="rounded-l-none bg-transparent" />
      </div>
    </div>;
};