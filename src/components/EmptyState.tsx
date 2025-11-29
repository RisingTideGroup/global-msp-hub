
import React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Building } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Pre-configured empty states for common scenarios
export const JobsEmptyState = ({ onCreateJob }: { onCreateJob?: () => void }) => (
  <EmptyState
    icon={<Briefcase className="h-12 w-12" />}
    title="No jobs found"
    description="We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later for new opportunities."
    actionLabel={onCreateJob ? "Post a Job" : undefined}
    onAction={onCreateJob}
  />
);

export const BusinessesEmptyState = ({ onCreateBusiness }: { onCreateBusiness?: () => void }) => (
  <EmptyState
    icon={<Building className="h-12 w-12" />}
    title="No businesses found"
    description="We couldn't find any businesses matching your search. Try different keywords or explore our directory."
    actionLabel={onCreateBusiness ? "Add Your Business" : undefined}
    onAction={onCreateBusiness}
  />
);
