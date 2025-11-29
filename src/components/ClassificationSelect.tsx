
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useClassifications, useCreateClassification } from "@/hooks/useClassifications";
import { useClassificationTypes } from "@/hooks/useClassificationTypes";
import { classificationSchema } from "@/lib/validations/classification";
import { useToast } from "@/hooks/use-toast";

interface ClassificationSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  type: string;
  useCase: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
}

export const ClassificationSelect = ({ 
  value, 
  onValueChange, 
  type, 
  useCase, 
  placeholder = `Select ${type.toLowerCase()}`, 
  required = false,
  label 
}: ClassificationSelectProps) => {
  const { data: classifications = [], isLoading } = useClassifications(type, useCase);
  const { data: classificationTypes = [] } = useClassificationTypes();
  const { mutate: createClassification, isPending } = useCreateClassification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClassificationName, setNewClassificationName] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Find the classification type to check settings
  const classificationType = classificationTypes.find(ct => ct.name === type);
  const allowUserSuggestions = classificationType?.allow_user_suggestions ?? false;
  const fieldType = classificationType?.field_type ?? 'select';

  const handleCreateClassification = () => {
    setError("");
    
    // Validate input
    const result = classificationSchema.safeParse({
      name: newClassificationName,
      type,
      use_case: [useCase],
      status: allowUserSuggestions ? 'approved' : 'pending'
    });
    
    if (!result.success) {
      const errorMsg = result.error.errors[0]?.message || "Invalid input";
      setError(errorMsg);
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }
    
    createClassification({
      name: result.data.name,
      type: result.data.type,
      use_case: result.data.use_case,
      status: result.data.status || (allowUserSuggestions ? 'approved' : 'pending')
    }, {
      onSuccess: () => {
        setNewClassificationName("");
        setError("");
        setIsDialogOpen(false);
      }
    });
  };

  // Prevent onChange from firing when options haven't loaded yet
  const handleValueChange = (newValue: string) => {
    // Only trigger parent onChange if classifications are loaded
    if (!isLoading && classifications.length > 0) {
      onValueChange(newValue);
    }
  };

  // For text fields, just show a text input
  if (fieldType === 'text') {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={`text-${type}`}>{label}</Label>}
        <Input
          id={`text-${type}`}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
        <p className="text-xs text-muted-foreground">
          Enter any value for {type.toLowerCase()}.
        </p>
      </div>
    );
  }

  // For select fields, show dropdown
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Select 
          value={value} 
          onValueChange={handleValueChange} 
          required={required}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {classifications.map((classification) => (
              <SelectItem key={classification.id} value={classification.name}>
                {classification.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {allowUserSuggestions && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Suggest New {type}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-classification">{type} Name</Label>
                  <Input
                    id="new-classification"
                    value={newClassificationName}
                    onChange={(e) => setNewClassificationName(e.target.value)}
                    placeholder={`Enter ${type.toLowerCase()} name`}
                    maxLength={100}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateClassification()}
                  />
                  {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{newClassificationName.length}/100 characters</p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateClassification} 
                    disabled={!newClassificationName.trim() || isPending}
                  >
                    {isPending ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {allowUserSuggestions ? (
        <p className="text-xs text-muted-foreground">
          Don't see your {type.toLowerCase()}? Click the + button to suggest a new one.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Contact an administrator to add new {type.toLowerCase()} options.
        </p>
      )}
    </div>
  );
};
