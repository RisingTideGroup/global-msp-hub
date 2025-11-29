
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useRequestGDPRDeletion } from "@/hooks/useGDPRDeletion";
import { Trash2, AlertTriangle } from "lucide-react";

export const GDPRDeletionDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmations, setConfirmations] = useState({
    understand: false,
    irreversible: false,
    backup: false,
    adminAction: false
  });
  const { mutate: requestDeletion, isPending } = useRequestGDPRDeletion();

  const allConfirmed = Object.values(confirmations).every(Boolean);

  const handleSubmit = () => {
    if (allConfirmed) {
      requestDeletion();
      setIsOpen(false);
      setConfirmations({ understand: false, irreversible: false, backup: false, adminAction: false });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Request Account Deletion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Request Account Deletion (GDPR)
          </DialogTitle>
          <DialogDescription>
            This will submit a request to permanently delete your account and all associated data. 
            Account deletion requires admin approval and may take up to 30 days to process.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notice:</h4>
            <p className="text-sm text-yellow-700">
              This only requests account deletion. Your login will remain active until an admin processes your request.
              If you want to immediately delete your business data, use the "Delete Business" option instead.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="understand"
              checked={confirmations.understand}
              onCheckedChange={(checked) => 
                setConfirmations(prev => ({ ...prev, understand: !!checked }))
              }
            />
            <label htmlFor="understand" className="text-sm">
              I understand this is only a deletion request
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="irreversible"
              checked={confirmations.irreversible}
              onCheckedChange={(checked) => 
                setConfirmations(prev => ({ ...prev, irreversible: !!checked }))
              }
            />
            <label htmlFor="irreversible" className="text-sm">
              I understand all my data will be permanently deleted when processed
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="backup"
              checked={confirmations.backup}
              onCheckedChange={(checked) => 
                setConfirmations(prev => ({ ...prev, backup: !!checked }))
              }
            />
            <label htmlFor="backup" className="text-sm">
              I have backed up any data I want to keep
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="adminAction"
              checked={confirmations.adminAction}
              onCheckedChange={(checked) => 
                setConfirmations(prev => ({ ...prev, adminAction: !!checked }))
              }
            />
            <label htmlFor="adminAction" className="text-sm">
              I understand this requires admin approval and may take up to 30 days
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={!allConfirmed || isPending}
          >
            {isPending ? "Submitting..." : "Submit Deletion Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
