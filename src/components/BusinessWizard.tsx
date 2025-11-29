import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { BusinessWizardStep } from "./BusinessWizardStep";
import { BusinessForm } from "./BusinessForm";
import { useCreateBusiness, useUpdateBusiness } from "@/hooks/useBusiness";
import { useSaveBusinessClassifications } from "@/hooks/useBusinessClassifications";
import { useBusinessWizard } from "@/hooks/useBusinessWizard";
import { useToast } from "@/hooks/use-toast";
import type { Business } from "@/types/shared";

interface BusinessWizardProps {
  business?: Business | null;
  mode: 'create' | 'edit';
}

export const BusinessWizard = ({ business, mode }: BusinessWizardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [coachingMode, setCoachingMode] = useState(business?.coaching_mode ?? true);
  const [businessData, setBusinessData] = useState({
    name: business?.name || "",
    industry: business?.industry || "",
    company_size: business?.company_size || "",
    location: business?.location || "",
    website: business?.website || "",
    description: business?.description || "",
    description_rich: business?.description_rich || "",
    mission: business?.mission || "",
    mission_rich: business?.mission_rich || "",
    values: business?.values || [],
    culture: business?.culture || "",
    culture_rich: business?.culture_rich || "",
    benefits: business?.benefits || "",
    benefits_rich: business?.benefits_rich || "",
    careers_page_url: business?.careers_page_url || "",
    coaching_mode: business?.coaching_mode ?? true,
    wizard_completed: business?.wizard_completed ?? false,
    logo_url: business?.logo_url || "",
    status: business?.status || ("draft" as const),
  });

  const { mutate: createBusiness, isPending: isCreating } = useCreateBusiness();
  const { mutate: updateBusiness, isPending: isUpdating } = useUpdateBusiness();
  const saveClassifications = useSaveBusinessClassifications();
  const { 
    saveProgress, 
    data: wizardProgress,
    isPending: isSaving 
  } = useBusinessWizard(business?.id || createdBusinessId);

  // Reduced total steps since we removed AI setup
  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (wizardProgress?.current_step) {
      setCurrentStep(wizardProgress.current_step);
    }
    if (wizardProgress?.wizard_data) {
      setBusinessData(prev => ({ ...prev, ...wizardProgress.wizard_data }));
    }
  }, [wizardProgress]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (mode === 'create') {
        createBusiness(businessData, {
          onSuccess: (newBusiness) => {
            setCreatedBusinessId(newBusiness.id);
            setCurrentStep(2);
            saveProgress(newBusiness.id, 2, [], businessData);
          }
        });
      } else if (business?.id) {
        updateBusiness({ 
          id: business.id, 
          ...businessData 
        }, {
          onSuccess: () => {
            setCurrentStep(2);
            saveProgress(business.id, 2, [], businessData);
          }
        });
      }
    } else if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const businessId = business?.id || createdBusinessId;
      if (businessId) {
        saveProgress(businessId, nextStep, [], businessData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldUpdate = (field: string, value: any) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const handleModeChange = (newMode: boolean) => {
    setCoachingMode(newMode);
    setBusinessData(prev => ({ ...prev, coaching_mode: newMode }));
  };

  const handleComplete = () => {
    const finalData = { 
      ...businessData, 
      wizard_completed: true,
      status: "pending" as const // Always set to pending when completing wizard
    };
    
    if (business?.id) {
      updateBusiness({ 
        id: business.id, 
        ...finalData 
      }, {
        onSuccess: () => {
          toast({
            title: "Business profile completed!",
            description: "Your business profile has been submitted for approval. You can now set up your AI assistant in the dashboard."
          });
          navigate("/business/dashboard");
        }
      });
    } else if (createdBusinessId) {
      updateBusiness({ 
        id: createdBusinessId, 
        ...finalData 
      }, {
        onSuccess: () => {
          toast({
            title: "Business profile completed!",
            description: "Your business profile has been submitted for approval. You can now set up your AI assistant in the dashboard."
          });
          navigate("/business/dashboard");
        }
      });
    }
  };

  const handleAdvancedFormSubmit = async (formData: any, classifications?: Record<string, string>) => {
    const finalData = { 
      ...formData, 
      wizard_completed: true,
      status: "pending" as const
    };
    
    try {
      if (business?.id) {
        await updateBusiness({ 
          id: business.id, 
          ...finalData 
        });
        
        // Save classifications if provided
        if (classifications && Object.keys(classifications).length > 0) {
          await saveClassifications.mutateAsync({
            businessId: business.id,
            classifications
          });
        }
      } else {
        const newBusiness = await new Promise<Business>((resolve, reject) => {
          createBusiness(finalData, {
            onSuccess: resolve,
            onError: reject
          });
        });
        
        // Save classifications if provided
        if (classifications && Object.keys(classifications).length > 0) {
          await saveClassifications.mutateAsync({
            businessId: newBusiness.id,
            classifications
          });
        }
      }
      
      toast({
        title: "Business profile completed!",
        description: "Your business profile has been submitted for approval. You can now set up your AI assistant in the dashboard."
      });
      navigate("/business/dashboard");
    } catch (error) {
      console.error('Failed to save business and classifications:', error);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !businessData.name || !businessData.industry || isCreating || isUpdating;
    }
    return isSaving || isUpdating;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Mode Toggle */}
        <div className="mb-8">
          <Card className="bg-white shadow-lg border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleModeChange(false)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      !coachingMode 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Advanced Mode
                  </button>
                  <button
                    onClick={() => handleModeChange(true)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      coachingMode 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Coach Me
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {coachingMode ? (
          // Coaching Mode - Step by step wizard
          <>
            <Card className="mb-8 bg-white shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="text-center text-xl">
                  {mode === 'create' ? 'Create Your Business Profile' : 'Edit Your Business Profile'}
                </CardTitle>
                
                <div className="space-y-2">
                  <Progress value={progress} className="w-full bg-blue-200" />
                  <p className="text-sm text-blue-100 text-center">
                    Step {currentStep} of {totalSteps}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <BusinessWizardStep
                  currentStep={currentStep}
                  businessData={businessData}
                  onFieldUpdate={handleFieldUpdate}
                  onNext={currentStep === totalSteps ? handleComplete : handleNext}
                  onBack={handleBack}
                  isNextDisabled={isNextDisabled()}
                  coachingMode={coachingMode}
                />
              </CardContent>
            </Card>

            {/* Human Coaching Link */}
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <span className="text-sm">Need personalized guidance?</span>
                  <a 
                    href="https://www.risingtidegroup.net" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 text-sm font-medium"
                  >
                    Get Human Coaching
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                onClick={currentStep === totalSteps ? handleComplete : handleNext}
                disabled={isNextDisabled()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep === totalSteps ? 'Submit for Approval' : 'Next'}
                {currentStep !== totalSteps && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          // Advanced Mode - Use the exact same BusinessForm as Edit Profile
          <Card className="mb-8 bg-white shadow-lg border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-center text-xl">
                {mode === 'create' ? 'Create Your Business Profile' : 'Edit Your Business Profile'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <BusinessForm
                business={business}
                onSubmit={handleAdvancedFormSubmit}
                isLoading={isCreating || isUpdating || saveClassifications.isPending}
                submitText="Submit for Approval"
                showCancel={false}
                mode={mode}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
