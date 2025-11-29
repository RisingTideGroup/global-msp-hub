
import { useState } from "react";
import { useCreateClassification } from "@/hooks/useClassifications";
import { useClassificationTypes } from "@/hooks/useClassificationTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classificationSchema } from "@/lib/validations/classification";
import { useToast } from "@/hooks/use-toast";

interface AdminClassificationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminClassificationCreateDialog = ({ open, onOpenChange }: AdminClassificationCreateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'approved' as 'pending' | 'approved' | 'rejected'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { mutate: createClassification, isPending } = useCreateClassification();
  const { data: types = [] } = useClassificationTypes();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const selectedType = types.find(t => t.name === formData.type);
    if (!selectedType) return;
    
    // Validate input
    const result = classificationSchema.safeParse({
      name: formData.name,
      type: formData.type,
      use_case: selectedType.use_case,
      status: formData.status
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
    
    createClassification({
      name: result.data.name,
      type: result.data.type,
      use_case: result.data.use_case,
      status: result.data.status || 'approved'
    }, {
      onSuccess: () => {
        setFormData({ name: '', type: '', status: 'approved' });
        setErrors({});
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Classification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter classification name"
              maxLength={100}
              required
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            <p className="text-xs text-muted-foreground mt-1">{formData.name.length}/100 characters</p>
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.filter(type => type.status === 'approved').map(type => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !formData.name.trim() || !formData.type}
            >
              {isPending ? 'Adding...' : 'Add Classification'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
