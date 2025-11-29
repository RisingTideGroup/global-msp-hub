
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusinessForm } from "./BusinessForm";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Business } from "@/hooks/useBusiness";

interface BusinessEditFormProps {
  business: Business | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BusinessEditForm = ({ business, onClose, onSuccess }: BusinessEditFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateBusinessWithClassifications = useMutation({
    mutationFn: async ({ businessData, classifications }: { 
      businessData: any; 
      classifications?: Record<string, string> 
    }) => {
      if (!business) throw new Error('Business not found');

      console.log('BusinessEditForm: Calling RPC with data:', { businessData, classifications });

      const { data, error } = await supabase.rpc('update_business_with_classifications', {
        p_business_id: business.id,
        p_business_data: businessData,
        p_classifications: classifications || {}
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('RPC Response:', data);

      // Type guard to check if data is an object with success property
      if (data && typeof data === 'object' && data !== null && !Array.isArray(data)) {
        const result = data as { success?: boolean; message?: string };
        if (result.success === false) {
          throw new Error(result.message || 'Failed to update business');
        }
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business-classifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
      
      toast({
        title: "Profile Updated",
        description: "Your business profile has been updated and set to pending approval.",
      });
      
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Failed to update business:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update business profile",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (formData: any, classifications?: Record<string, string>) => {
    if (!business) return;

    try {
      console.log('BusinessEditForm: Raw form data received:', formData);
      console.log('BusinessEditForm: Classifications received:', classifications);

      // Create a clean business data object with only core business fields
      const coreBusinessData = {
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
        status: "pending" // Always set to pending when editing
      };

      console.log('BusinessEditForm: Clean business data for RPC:', coreBusinessData);

      // Call the RPC function with both business data and classifications
      await updateBusinessWithClassifications.mutateAsync({
        businessData: coreBusinessData,
        classifications
      });
      
    } catch (error) {
      console.error('Failed to update business:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Edit Business Profile
          </DialogTitle>
        </DialogHeader>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-orange-800">Profile Review Required</h4>
              <p className="text-sm text-orange-700 mt-1">
                After editing your profile, it will be set to "pending approval" and won't be visible publicly until reviewed and approved again.
              </p>
            </div>
          </div>
        </div>

        <BusinessForm
          business={business}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={updateBusinessWithClassifications.isPending}
          submitText="Save Changes"
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  );
};
