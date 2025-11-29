import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, RefreshCcw } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { FormFieldGroup } from "./FormFieldGroup";
import { ClassificationSelect } from "./ClassificationSelect";
import { useClassificationTypes } from "@/hooks/useClassificationTypes";
import { useClassifications } from "@/hooks/useClassifications";
import { useWebsiteLogo } from "@/hooks/useWebsiteLogo";
import { useBusinessClassifications } from "@/hooks/useBusinessClassifications";
import { useToast } from "@/hooks/use-toast";
import type { Business } from "@/hooks/useBusiness";
import { businessSchema, MAX_LENGTHS } from "@/lib/validations/business";

interface BusinessFormData {
  name: string;
  description: string;
  description_rich: string;
  industry: string;
  company_size: string;
  location: string;
  website: string;
  mission: string;
  mission_rich: string;
  culture: string;
  culture_rich: string;
  values: string[];
  benefits: string;
  benefits_rich: string;
  logo_url: string;
  careers_page_url: string;
  // Dynamic fields for classifications
  [key: string]: string | string[];
}

interface BusinessFormProps {
  business?: Business | null;
  onSubmit: (data: BusinessFormData, classifications?: Record<string, string>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitText?: string;
  showCancel?: boolean;
  mode?: 'create' | 'edit';
}

export const BusinessForm = ({ 
  business, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  submitText = "Submit",
  showCancel = true,
  mode = 'create'
}: BusinessFormProps) => {
  const { toast } = useToast();
  const fetchLogo = useWebsiteLogo();
  
  // Get all classification types that should appear on business forms
  const { data: classificationTypes = [] } = useClassificationTypes();
  const { data: allClassifications = [] } = useClassifications();
  
  // Get existing classifications for this business
  const { data: existingClassifications = [] } = useBusinessClassifications(business?.id);
  
  // Filter to only business-related types and sort by display order
  // Include text fields always, select fields only if they have options
  const businessClassificationTypes = classificationTypes
    .filter(type => {
      if (!type.use_case.includes('business')) return false;
      if (type.field_type === 'text') return true;
      // For select fields, only include if there are classification options
      return allClassifications.some(c => c.type === type.name && c.use_case.includes('business'));
    })
    .sort((a, b) => {
      const orderA = a.display_order?.['business'] || 0;
      const orderB = b.display_order?.['business'] || 0;
      return orderA - orderB;
    });
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    description_rich: "",
    industry: "",
    company_size: "",
    location: "",
    website: "",
    mission: "",
    mission_rich: "",
    culture: "",
    culture_rich: "",
    values: [],
    benefits: "",
    benefits_rich: "",
    logo_url: "",
    careers_page_url: "",
  });

  const [newValue, setNewValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Track classification values separately
  const [classificationValues, setClassificationValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (business) {
      console.log('BusinessForm: Setting form data from business:', business);
      const newFormData: BusinessFormData = {
        name: business.name || "",
        description: business.description || "",
        description_rich: business.description_rich || "",
        industry: business.industry || "",
        company_size: business.company_size || "",
        location: business.location || "",
        website: business.website || "",
        mission: business.mission || "",
        mission_rich: business.mission_rich || "",
        culture: business.culture || "",
        culture_rich: business.culture_rich || "",
        values: business.values || [],
        benefits: business.benefits || "",
        benefits_rich: business.benefits_rich || "",
        logo_url: business.logo_url || "",
        careers_page_url: business.careers_page_url || "",
      };

      setFormData(newFormData);
    }
  }, [business]);
  
  // Load existing classifications when available
  useEffect(() => {
    if (existingClassifications.length > 0) {
      const classificationMap = existingClassifications.reduce((acc, classification) => {
        acc[classification.classification_type] = classification.classification_value;
        return acc;
      }, {} as Record<string, string>);
      setClassificationValues(classificationMap);
    }
  }, [existingClassifications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('BusinessForm: Submitting form data:', formData);
    
    // Separate core business fields from dynamic classification fields
    const coreBusinessFields = {
      name: formData.name,
      description: formData.description,
      description_rich: formData.description_rich,
      industry: formData.industry,
      company_size: formData.company_size,
      location: formData.location,
      website: formData.website,
      mission: formData.mission,
      mission_rich: formData.mission_rich,
      culture: formData.culture,
      culture_rich: formData.culture_rich,
      values: formData.values,
      benefits: formData.benefits,
      benefits_rich: formData.benefits_rich,
      logo_url: formData.logo_url,
      careers_page_url: formData.careers_page_url,
    };

    // Validate form data
    const result = businessSchema.safeParse(coreBusinessFields);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive"
      });
      return;
    }

    setValidationErrors({});
    console.log('BusinessForm: Core business fields:', coreBusinessFields);
    console.log('BusinessForm: Classification fields:', classificationValues);
    
    onSubmit(coreBusinessFields, classificationValues);
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string | string[]) => {
    console.log('BusinessForm: Updating field', field, 'with value:', value);
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('BusinessForm: Updated form data:', updated);
      return updated;
    });
  };

  const handleAddValue = () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    
    if (formData.values.includes(trimmed)) {
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
    
    if (formData.values.length >= MAX_LENGTHS.max_values) {
      toast({
        title: "Too many values",
        description: `Maximum ${MAX_LENGTHS.max_values} values allowed.`,
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      values: [...prev.values, trimmed]
    }));
    setNewValue('');
  };

  const handleRemoveValue = (valueToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter(value => value !== valueToRemove)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleInputChange("logo_url", base64);
        setUploadingImage(false);
        toast({
          title: "Image uploaded",
          description: "Logo image has been uploaded successfully."
        });
      };
      reader.onerror = () => {
        setUploadingImage(false);
        toast({
          title: "Upload failed",
          description: "Failed to upload the image.",
          variant: "destructive"
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingImage(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload the image.",
        variant: "destructive"
      });
    }
  };

  const handleFetchLogo = async () => {
    if (!formData.website) {
      toast({
        title: "Website required",
        description: "Please enter a website URL first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const metadata = await fetchLogo.mutateAsync(formData.website);
      if (metadata.logoUrl) {
        handleInputChange("logo_url", metadata.logoUrl);
        toast({
          title: "Logo fetched",
          description: "Successfully retrieved logo from website."
        });
      } else {
        toast({
          title: "No logo found",
          description: "Could not find a suitable logo on the website.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error fetching logo",
        description: "Failed to retrieve logo from website.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormFieldGroup>
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            placeholder="Enter company name"
            maxLength={MAX_LENGTHS.name}
            className={validationErrors.name ? "border-destructive" : ""}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-destructive">{validationErrors.name}</span>
            <span className="text-muted-foreground">{formData.name.length}/{MAX_LENGTHS.name}</span>
          </div>
        </div>
        
        {/* Dynamic Classification Fields in first row */}
        {businessClassificationTypes.slice(0, 1).map((classificationType) => {
          return (
            <div key={classificationType.id}>
              <ClassificationSelect
                value={classificationValues[classificationType.name] || ""}
                onValueChange={(value) => setClassificationValues(prev => ({ ...prev, [classificationType.name]: value }))}
                type={classificationType.name}
                useCase="business"
                label={classificationType.name}
                placeholder={`${classificationType.field_type === 'text' ? 'Enter' : 'Select'} ${classificationType.name.toLowerCase()}`}
              />
            </div>
          );
        })}
      </FormFieldGroup>

      <FormFieldGroup>
        <div>
          <Label htmlFor="company_size">Company Size</Label>
          <Select value={formData.company_size} onValueChange={(value) => handleInputChange("company_size", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501-1000">501-1000 employees</SelectItem>
              <SelectItem value="1000+">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="e.g., San Francisco, CA"
            maxLength={MAX_LENGTHS.location}
            className={validationErrors.location ? "border-destructive" : ""}
          />
          <div className="flex justify-between text-xs mt-1">
            <span className="text-destructive">{validationErrors.location}</span>
            <span className="text-muted-foreground">{formData.location.length}/{MAX_LENGTHS.location}</span>
          </div>
        </div>
      </FormFieldGroup>

      {/* Additional Dynamic Classification Fields */}
      {businessClassificationTypes.slice(1).map((classificationType) => {
        return (
          <div key={classificationType.id}>
            <ClassificationSelect
              value={classificationValues[classificationType.name] || ""}
              onValueChange={(value) => setClassificationValues(prev => ({ ...prev, [classificationType.name]: value }))}
              type={classificationType.name}
              useCase="business"
              label={classificationType.name}
              placeholder={`${classificationType.field_type === 'text' ? 'Enter' : 'Select'} ${classificationType.name.toLowerCase()}`}
            />
          </div>
        );
      })}

      <FormFieldGroup>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://yourcompany.com"
            maxLength={MAX_LENGTHS.website}
            className={validationErrors.website ? "border-destructive" : ""}
          />
          {validationErrors.website && (
            <p className="text-xs text-destructive mt-1">{validationErrors.website}</p>
          )}
        </div>
        <div>
          <Label htmlFor="careers_page_url">Careers Page URL</Label>
          <Input
            id="careers_page_url"
            value={formData.careers_page_url}
            onChange={(e) => handleInputChange("careers_page_url", e.target.value)}
            placeholder="https://yourcompany.com/careers"
            maxLength={MAX_LENGTHS.careers_page_url}
            className={validationErrors.careers_page_url ? "border-destructive" : ""}
          />
          {validationErrors.careers_page_url && (
            <p className="text-xs text-destructive mt-1">{validationErrors.careers_page_url}</p>
          )}
        </div>
      </FormFieldGroup>

      <div>
        <Label htmlFor="logo_url">Company Logo</Label>
        <div className="space-y-3 mt-1">
          <div className="flex gap-2">
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => handleInputChange("logo_url", e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleFetchLogo}
              disabled={fetchLogo.isPending || !formData.website}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              {fetchLogo.isPending ? 'Fetching...' : 'Fetch from Website'}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">or</span>
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={uploadingImage}
                className="flex items-center gap-2"
              >
                <span>
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </span>
              </Button>
            </Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          
          {formData.logo_url && (
            <div className="mt-2">
              <img 
                src={formData.logo_url} 
                alt="Logo preview" 
                className="w-16 h-16 rounded-lg object-cover border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Company Description *</Label>
        <RichTextEditor
          value={formData.description_rich || formData.description}
          onChange={(value) => {
            handleInputChange("description_rich", value);
            handleInputChange("description", value.replace(/<[^>]*>/g, ''));
          }}
          placeholder="Tell us about your company..."
          height="150px"
          aiCoachingType="general"
          businessContext={formData}
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-destructive">{validationErrors.description_rich || validationErrors.description}</span>
          <span className="text-muted-foreground">{formData.description_rich.length}/{MAX_LENGTHS.description_rich}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="mission">Mission Statement</Label>
        <RichTextEditor
          value={formData.mission_rich || formData.mission}
          onChange={(value) => {
            handleInputChange("mission_rich", value);
            handleInputChange("mission", value.replace(/<[^>]*>/g, ''));
          }}
          placeholder="What's your company's mission?"
          height="120px"
          aiCoachingType="mission"
          businessContext={formData}
        />
        <div className="flex justify-end text-xs mt-1">
          <span className="text-muted-foreground">{formData.mission_rich.length}/{MAX_LENGTHS.mission_rich}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="culture">Company Culture</Label>
        <RichTextEditor
          value={formData.culture_rich || formData.culture}
          onChange={(value) => {
            handleInputChange("culture_rich", value);
            handleInputChange("culture", value.replace(/<[^>]*>/g, ''));
          }}
          placeholder="Describe your company culture..."
          height="120px"
          aiCoachingType="culture"
          businessContext={formData}
        />
        <div className="flex justify-end text-xs mt-1">
          <span className="text-muted-foreground">{formData.culture_rich.length}/{MAX_LENGTHS.culture_rich}</span>
        </div>
      </div>

      <div>
        <Label>Company Values</Label>
        <div className="mt-2 space-y-3">
          <div className="flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Add a company value"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
            />
            <Button type="button" onClick={handleAddValue}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.values.map((value, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {value}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveValue(value)} 
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="benefits">Benefits & Perks</Label>
        <RichTextEditor
          value={formData.benefits_rich || formData.benefits}
          onChange={(value) => {
            handleInputChange("benefits_rich", value);
            handleInputChange("benefits", value.replace(/<[^>]*>/g, ''));
          }}
          placeholder="What benefits and perks do you offer?"
          height="120px"
          aiCoachingType="benefits"
          businessContext={formData}
        />
      </div>

      <div className="flex justify-end space-x-2">
        {showCancel && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
};
