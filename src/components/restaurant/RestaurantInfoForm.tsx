
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RestaurantInfoFormProps {
  formData: {
    owner_name: string;
    restaurant_name: string;
    owner_number: string;
    owner_email: string;
    about: string;
  };
  onFormChange: (field: string, value: string) => void;
  onRestaurantNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RestaurantInfoForm = ({ 
  formData, 
  onFormChange, 
  onRestaurantNameChange 
}: RestaurantInfoFormProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="owner_name">Owner Name</Label>
          <Input 
            id="owner_name" 
            value={formData.owner_name} 
            onChange={e => onFormChange('owner_name', e.target.value)} 
            placeholder="Enter owner name" 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurant_name">Restaurant Name</Label>
          <Input 
            id="restaurant_name" 
            value={formData.restaurant_name} 
            onChange={onRestaurantNameChange} 
            placeholder="Enter restaurant name" 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_number">Phone Number</Label>
          <Input 
            id="owner_number" 
            value={formData.owner_number} 
            onChange={e => onFormChange('owner_number', e.target.value)} 
            placeholder="Enter phone number" 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_email">Email</Label>
          <Input 
            id="owner_email" 
            type="email" 
            value={formData.owner_email} 
            onChange={e => onFormChange('owner_email', e.target.value)} 
            placeholder="Enter email" 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">About Restaurant</Label>
        <Textarea 
          id="about" 
          value={formData.about} 
          onChange={e => onFormChange('about', e.target.value)} 
          placeholder="Tell us about your restaurant" 
          className="h-32" 
        />
      </div>
    </>
  );
};
