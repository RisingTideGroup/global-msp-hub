
import { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Skull, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessDelete } from "@/hooks/useBusinessDelete";

interface BusinessDeleteDialogProps {
  businessName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const BusinessDeleteDialog = ({ businessName, onClose, onConfirm }: BusinessDeleteDialogProps) => {
  const { user } = useAuth();
  const { mutate: deleteBusiness, isPending: isDeleting } = useBusinessDelete();
  
  const [step, setStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState('');
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState({
    dataLoss: false,
    permanent: false,
    gdpr: false,
    accountDeletion: false
  });

  const canProceedToStep2 = Object.values(acknowledgedWarnings).every(Boolean);
  const canDelete = confirmationText === 'DELETE MY BUSINESS AND ACCOUNT';

  const handleDeleteBusiness = () => {
    if (!user || !canDelete) return;
    
    deleteBusiness(undefined, {
      onSuccess: () => {
        onConfirm();
      }
    });
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Skull className="h-6 w-6" />
            {step === 1 ? 'Permanent Account Deletion' : 'Final Confirmation Required'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              {step === 1 && (
                <>
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-red-800 text-lg">⚠️ DANGER ZONE ⚠️</h4>
                        <p className="text-red-700 font-medium">
                          You are about to permanently delete your business profile and entire account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      What will be permanently deleted:
                    </h4>
                    
                    <ul className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        Your business profile for "{businessName}"
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        All job postings created by your business
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        All job applications received for your jobs
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        Your user account and login credentials
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        All associated data and analytics
                      </li>
                    </ul>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">GDPR Compliance Notice:</h5>
                      <p className="text-sm text-yellow-700">
                        This action is irreversible and designed to comply with GDPR data deletion requests. 
                        Once confirmed, all your personal data will be permanently removed from our systems within 30 days.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="font-semibold text-gray-900">To proceed, you must acknowledge the following:</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="dataLoss"
                            checked={acknowledgedWarnings.dataLoss}
                            onCheckedChange={(checked) => 
                              setAcknowledgedWarnings({...acknowledgedWarnings, dataLoss: !!checked})
                            }
                          />
                          <Label htmlFor="dataLoss" className="text-sm leading-5">
                            I understand that <strong>all data will be permanently lost</strong> and cannot be recovered
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="permanent"
                            checked={acknowledgedWarnings.permanent}
                            onCheckedChange={(checked) => 
                              setAcknowledgedWarnings({...acknowledgedWarnings, permanent: !!checked})
                            }
                          />
                          <Label htmlFor="permanent" className="text-sm leading-5">
                            I understand this action is <strong>permanent and irreversible</strong>
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="gdpr"
                            checked={acknowledgedWarnings.gdpr}
                            onCheckedChange={(checked) => 
                              setAcknowledgedWarnings({...acknowledgedWarnings, gdpr: !!checked})
                            }
                          />
                          <Label htmlFor="gdpr" className="text-sm leading-5">
                            I understand this is a <strong>GDPR data deletion request</strong> and all personal data will be removed
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="accountDeletion"
                            checked={acknowledgedWarnings.accountDeletion}
                            onCheckedChange={(checked) => 
                              setAcknowledgedWarnings({...acknowledgedWarnings, accountDeletion: !!checked})
                            }
                          />
                          <Label htmlFor="accountDeletion" className="text-sm leading-5">
                            I understand my <strong>entire account will be deleted</strong> and I will be logged out
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-6">
                    <div className="text-center">
                      <Skull className="h-12 w-12 text-red-600 mx-auto mb-4" />
                      <h4 className="font-bold text-red-800 text-xl mb-2">FINAL WARNING</h4>
                      <p className="text-red-700 font-medium">
                        This is your last chance to cancel. Once you confirm, your account will be permanently deleted.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="confirmation" className="text-sm font-semibold">
                        Type exactly: <code className="bg-red-100 px-2 py-1 rounded text-red-800">DELETE MY BUSINESS AND ACCOUNT</code>
                      </Label>
                      <Input
                        id="confirmation"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder="Type the confirmation text"
                        className="mt-2 border-red-300 focus:border-red-500"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Business to be deleted:</strong> {businessName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Account email:</strong> {user?.email}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel & Keep Account
          </Button>
          
          {step === 1 && (
            <Button 
              onClick={() => setStep(2)}
              disabled={!canProceedToStep2}
              className="bg-red-600 hover:bg-red-700"
            >
              I Understand, Continue →
            </Button>
          )}

          {step === 2 && (
            <Button 
              onClick={handleDeleteBusiness}
              disabled={!canDelete || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : '💀 DELETE FOREVER 💀'}
            </Button>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
