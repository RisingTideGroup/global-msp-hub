
import { AdminClassificationCreateDialog } from "./AdminClassificationCreateDialog";

interface AdminIndustryCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminIndustryCreateDialog = ({ open, onOpenChange }: AdminIndustryCreateDialogProps) => {
  return (
    <AdminClassificationCreateDialog 
      open={open} 
      onOpenChange={onOpenChange}
    />
  );
};
