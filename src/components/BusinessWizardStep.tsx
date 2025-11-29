
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { IndustrySelect } from "./IndustrySelect";

interface BusinessWizardStepProps {
  currentStep: number;
  businessData: any;
  onFieldUpdate: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isNextDisabled: boolean;
  coachingMode: boolean;
}

export const BusinessWizardStep = ({
  currentStep,
  businessData,
  onFieldUpdate,
  onNext,
  onBack,
  isNextDisabled,
  coachingMode
}: BusinessWizardStepProps) => {
  const [newValue, setNewValue] = useState('');

  const handleAddValue = () => {
    if (newValue.trim() && !businessData.values.includes(newValue.trim())) {
      onFieldUpdate('values', [...businessData.values, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    onFieldUpdate('values', businessData.values.filter((value: string) => value !== valueToRemove));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Let's start with the essentials about your company</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={businessData.name}
                  onChange={(e) => onFieldUpdate('name', e.target.value)}
                  placeholder="Enter your company name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry</Label>
                <IndustrySelect
                  value={businessData.industry}
                  onValueChange={(value) => onFieldUpdate('industry', value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company_size">Company Size</Label>
                <Select value={businessData.company_size} onValueChange={(value) => onFieldUpdate('company_size', value)}>
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
                  value={businessData.location}
                  onChange={(e) => onFieldUpdate('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Online Presence</h3>
              <p className="text-gray-600">Share your website and careers information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={businessData.website}
                  onChange={(e) => onFieldUpdate('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <Label htmlFor="careers_page_url">Careers Page URL</Label>
                <Input
                  id="careers_page_url"
                  value={businessData.careers_page_url}
                  onChange={(e) => onFieldUpdate('careers_page_url', e.target.value)}
                  placeholder="https://yourcompany.com/careers"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Description</h3>
              <p className="text-gray-600">Tell people what your company does</p>
            </div>

            <div>
              <Label htmlFor="description">Company Description *</Label>
              <RichTextEditor
                value={businessData.description_rich || businessData.description}
                onChange={(value) => {
                  onFieldUpdate('description_rich', value);
                  onFieldUpdate('description', value.replace(/<[^>]*>/g, ''));
                }}
                placeholder="Describe what your company does, its products or services, and what makes it unique..."
                height="200px"
                aiCoachingType="general"
                businessContext={businessData}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Mission Statement</h3>
              <p className="text-gray-600">What's your company's purpose and impact?</p>
            </div>

            <div>
              <Label htmlFor="mission">Mission Statement</Label>
              <RichTextEditor
                value={businessData.mission_rich || businessData.mission}
                onChange={(value) => {
                  onFieldUpdate('mission_rich', value);
                  onFieldUpdate('mission', value.replace(/<[^>]*>/g, ''));
                }}
                placeholder="What's your company's mission and purpose?"
                height="150px"
                aiCoachingType="mission"
                businessContext={businessData}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Culture & Values</h3>
              <p className="text-gray-600">What's it like to work at your company?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="culture">Company Culture</Label>
                <RichTextEditor
                  value={businessData.culture_rich || businessData.culture}
                  onChange={(value) => {
                    onFieldUpdate('culture_rich', value);
                    onFieldUpdate('culture', value.replace(/<[^>]*>/g, ''));
                  }}
                  placeholder="Describe your workplace environment, team dynamics, and company culture..."
                  height="150px"
                  aiCoachingType="culture"
                  businessContext={businessData}
                />
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
                    {businessData.values.map((value: string, index: number) => (
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
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Benefits & Perks</h3>
              <p className="text-gray-600">What do you offer your employees?</p>
            </div>

            <div>
              <Label htmlFor="benefits">Benefits & Perks</Label>
              <RichTextEditor
                value={businessData.benefits_rich || businessData.benefits}
                onChange={(value) => {
                  onFieldUpdate('benefits_rich', value);
                  onFieldUpdate('benefits', value.replace(/<[^>]*>/g, ''));
                }}
                placeholder="Describe your benefits package, perks, and what makes working at your company great..."
                height="200px"
                aiCoachingType="benefits"
                businessContext={businessData}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Ready to Submit!</h4>
              <p className="text-sm text-blue-700">
                Once you click "Submit for Approval", your business profile will be reviewed and published. 
                You can set up your AI assistant and manage jobs from your dashboard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderStep()}
      
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex items-center gap-2"
        >
          {currentStep === 6 ? 'Submit for Approval' : 'Next'}
          {currentStep !== 6 && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
