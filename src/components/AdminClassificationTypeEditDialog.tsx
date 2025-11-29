
import { useState, useEffect } from "react";
import { useUpdateClassificationType } from "@/hooks/useClassificationTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassificationType } from "@/hooks/useClassificationTypes";
import { classificationTypeSchema } from "@/lib/validations/classification";
import { useToast } from "@/hooks/use-toast";

interface AdminClassificationTypeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classificationType: ClassificationType | null;
}

export const AdminClassificationTypeEditDialog = ({ 
  open, 
  onOpenChange, 
  classificationType 
}: AdminClassificationTypeEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    use_case: [] as string[],
    status: 'approved' as 'pending' | 'approved' | 'rejected',
    allow_user_suggestions: true,
    field_type: 'select' as 'text' | 'select',
    display_order: {} as Record<string, number>
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { mutate: updateType, isPending } = useUpdateClassificationType();
  const { toast } = useToast();

  const availableUseCases = [
    { id: 'business', label: 'Business Forms' },
    { id: 'job', label: 'Job Forms' },
    { id: 'applicant', label: 'Applicant Forms' }
  ];

  useEffect(() => {
    if (classificationType) {
      setFormData({
        name: classificationType.name,
        use_case: classificationType.use_case,
        status: classificationType.status,
        allow_user_suggestions: classificationType.allow_user_suggestions,
        field_type: classificationType.field_type,
        display_order: classificationType.display_order || {}
      });
    }
  }, [classificationType]);

  const handleUseCaseChange = (useCaseId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        use_case: [...prev.use_case, useCaseId],
        display_order: { ...prev.display_order, [useCaseId]: prev.display_order[useCaseId] || 0 }
      }));
    } else {
      setFormData(prev => {
        const newDisplayOrder = { ...prev.display_order };
        delete newDisplayOrder[useCaseId];
        return {
          ...prev,
          use_case: prev.use_case.filter(id => id !== useCaseId),
          display_order: newDisplayOrder
        };
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classificationType) return;
    setErrors({});
    
    // Validate input
    const result = classificationTypeSchema.safeParse({
      name: formData.name,
      use_case: formData.use_case,
      status: formData.status,
      allow_user_suggestions: formData.allow_user_suggestions,
      field_type: formData.field_type,
      display_order: formData.display_order
    });
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive"
      });
      return;
    }
    
    updateType({
      typeId: classificationType.id,
      name: result.data.name,
      use_case: result.data.use_case,
      status: result.data.status,
      allow_user_suggestions: result.data.allow_user_suggestions,
      field_type: result.data.field_type,
      display_order: result.data.display_order
    }, {
      onSuccess: () => {
        setErrors({});
        onOpenChange(false);
      }
    });
  };

  if (!classificationType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Classification Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Type Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter classification type name"
              maxLength={50}
              required
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            <p className="text-xs text-muted-foreground mt-1">{formData.name.length}/50 characters</p>
          </div>

          <div>
            <Label htmlFor="field_type">Field Type</Label>
            <Select 
              value={formData.field_type} 
              onValueChange={(value: 'text' | 'select') => setFormData(prev => ({ ...prev, field_type: value }))}
            >
              <SelectTrigger id="field_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Select Dropdown</SelectItem>
                <SelectItem value="text">Text Input</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select: Users choose from predefined options. Text: Users can enter any value.
            </p>
          </div>

          <div>
            <Label>Use Cases (where this type should appear)</Label>
            <div className="space-y-3 mt-2">
              {availableUseCases.map((useCase) => (
                <div key={useCase.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={useCase.id}
                      checked={formData.use_case.includes(useCase.id)}
                      onCheckedChange={(checked) => handleUseCaseChange(useCase.id, !!checked)}
                    />
                    <Label htmlFor={useCase.id} className="text-sm font-normal">
                      {useCase.label}
                    </Label>
                  </div>
                  {formData.use_case.includes(useCase.id) && (
                    <div className="ml-6">
                      <Label htmlFor={`order-${useCase.id}`} className="text-xs text-muted-foreground">
                        Display Order for {useCase.label}
                      </Label>
                      <Input
                        id={`order-${useCase.id}`}
                        type="number"
                        min="0"
                        value={formData.display_order[useCase.id] || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          display_order: {
                            ...prev.display_order,
                            [useCase.id]: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <div className="space-y-2 mt-2">
              {[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
              ].map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={status.value}
                    checked={formData.status === status.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData(prev => ({ ...prev, status: status.value as any }));
                      }
                    }}
                  />
                  <Label htmlFor={status.value} className="text-sm font-normal">
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow_user_suggestions"
              checked={formData.allow_user_suggestions}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_user_suggestions: !!checked }))}
            />
            <Label htmlFor="allow_user_suggestions" className="text-sm font-normal">
              Allow users to suggest new classifications for this type
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !formData.name.trim() || formData.use_case.length === 0}
            >
              {isPending ? 'Updating...' : 'Update Classification Type'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
