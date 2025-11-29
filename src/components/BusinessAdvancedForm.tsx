
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { IndustrySelect } from "./IndustrySelect";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { MAX_LENGTHS } from "@/lib/validations/business";

interface BusinessAdvancedFormProps {
  businessData: any;
  onFieldUpdate: (field: string, value: any) => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export const BusinessAdvancedForm = ({ 
  businessData, 
  onFieldUpdate, 
  onComplete,
  isLoading = false
}: BusinessAdvancedFormProps) => {
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();

  const addValue = () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    
    if (businessData.values.includes(trimmed)) {
      toast({
        title: "Duplicate value",
        description: "This value already exists.",
        variant: "destructive"
      });
      return;
    }
    
    if (trimmed.length > MAX_LENGTHS.value) {
      toast({
        title: "Value too long",
        description: `Each value must be less than ${MAX_LENGTHS.value} characters.`,
        variant: "destructive"
      });
      return;
    }
    
    if (businessData.values.length >= MAX_LENGTHS.max_values) {
      toast({
        title: "Too many values",
        description: `Maximum ${MAX_LENGTHS.max_values} values allowed.`,
        variant: "destructive"
      });
      return;
    }
    
    onFieldUpdate("values", [...businessData.values, trimmed]);
    setNewValue("");
  };

  const removeValue = (valueToRemove: string) => {
    onFieldUpdate("values", businessData.values.filter((v: string) => v !== valueToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addValue();
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={businessData.name}
                onChange={(e) => onFieldUpdate("name", e.target.value)}
                placeholder="Enter your business name"
                maxLength={MAX_LENGTHS.name}
                required
              />
              <div className="flex justify-end text-xs mt-1">
                <span className="text-muted-foreground">{businessData.name.length}/{MAX_LENGTHS.name}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <IndustrySelect
                value={businessData.industry}
                onValueChange={(value) => onFieldUpdate("industry", value)}
              />
            </div>

            <div>
              <Label htmlFor="company_size">Company Size</Label>
              <Input
                id="company_size"
                value={businessData.company_size}
                onChange={(e) => onFieldUpdate("company_size", e.target.value)}
                placeholder="e.g., 1-10 employees, 50-200 employees"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={businessData.location}
                onChange={(e) => onFieldUpdate("location", e.target.value)}
                placeholder="City, State/Country"
                maxLength={MAX_LENGTHS.location}
              />
              <div className="flex justify-end text-xs mt-1">
                <span className="text-muted-foreground">{businessData.location.length}/{MAX_LENGTHS.location}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={businessData.website}
                onChange={(e) => onFieldUpdate("website", e.target.value)}
                placeholder="https://www.example.com"
                maxLength={MAX_LENGTHS.website}
              />
            </div>

            <div>
              <Label htmlFor="description">Brief Description</Label>
              <Textarea
                id="description"
                value={businessData.description}
                onChange={(e) => onFieldUpdate("description", e.target.value)}
                placeholder="What does your business do?"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Mission Statement</h3>
        <RichTextEditor
          value={businessData.mission}
          onChange={(value) => onFieldUpdate("mission", value)}
          placeholder="Describe your company's mission and core purpose..."
          height="150px"
          aiCoachingType="mission"
          businessContext={businessData}
        />
        <div className="flex justify-end text-xs">
          <span className="text-muted-foreground">{businessData.mission.length}/{MAX_LENGTHS.mission_rich}</span>
        </div>
      </div>

      {/* Values */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Company Values</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a company value"
                maxLength={MAX_LENGTHS.value}
              />
              <div className="flex justify-end text-xs mt-1">
                <span className="text-muted-foreground">{newValue.length}/{MAX_LENGTHS.value}</span>
              </div>
            </div>
            <Button onClick={addValue} type="button" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {businessData.values.map((value: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
                {value}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeValue(value)}
                />
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{businessData.values.length}/{MAX_LENGTHS.max_values} values</p>
        </div>
      </div>

      {/* Culture */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Company Culture</h3>
        <RichTextEditor
          value={businessData.culture}
          onChange={(value) => onFieldUpdate("culture", value)}
          placeholder="Tell potential employees about your company culture, work environment, and what it's like to work at your company..."
          height="150px"
          aiCoachingType="culture"
          businessContext={businessData}
        />
        <div className="flex justify-end text-xs">
          <span className="text-muted-foreground">{businessData.culture.length}/{MAX_LENGTHS.culture_rich}</span>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Employee Benefits</h3>
        <RichTextEditor
          value={businessData.benefits}
          onChange={(value) => onFieldUpdate("benefits", value)}
          placeholder="List the benefits, perks, and compensation you offer to employees..."
          height="150px"
          aiCoachingType="benefits"
          businessContext={businessData}
        />
        <div className="flex justify-end text-xs">
          <span className="text-muted-foreground">{businessData.benefits.length}/{MAX_LENGTHS.benefits_rich}</span>
        </div>
      </div>

      {/* Careers Page */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Careers Page</h3>
        <div>
          <Label htmlFor="careers_page_url">Careers Page URL</Label>
            <Input
              id="careers_page_url"
              type="url"
              value={businessData.careers_page_url}
              onChange={(e) => onFieldUpdate("careers_page_url", e.target.value)}
              placeholder="https://www.example.com/careers"
              className="mt-1"
              maxLength={MAX_LENGTHS.careers_page_url}
            />
          <p className="text-sm text-gray-500 mt-2">
            If you have an existing careers page, you can link to it here. This is optional.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={onComplete}
          disabled={isLoading || !businessData.name || !businessData.industry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          Submit for Approval
        </Button>
      </div>
    </div>
  );
};
