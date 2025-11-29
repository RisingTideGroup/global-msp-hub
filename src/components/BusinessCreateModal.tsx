
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { BusinessWizard } from "./BusinessWizard";
import type { Business } from "@/hooks/useBusiness";

interface BusinessCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business?: Business | null;
}

export const BusinessCreateModal = ({ open, onOpenChange, business }: BusinessCreateModalProps) => {
  const handleModalClose = () => {
    onOpenChange(false);
    // Redirect to business dashboard after modal closes
    setTimeout(() => {
      window.location.href = '/business/dashboard';
    }, 100);
  };

  const isDraft = business?.status === 'draft';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            {isDraft && <AlertTriangle className="h-5 w-5 text-orange-500" />}
            {isDraft ? 'Complete Your Business Profile' : 'Create Your Business Profile'}
          </DialogTitle>
        </DialogHeader>
        
        {isDraft && (
          <div className="mx-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Complete Your Draft</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your business profile is currently in draft. Complete and submit it for approval to make it visible publicly.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <BusinessWizard 
            mode={isDraft ? "edit" : "create"}
            business={business}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
