
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Briefcase, 
  Building, 
  BookmarkX, 
  UserX,
  FileText,
  Plus
} from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
    {action && (
      <Button onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);

export const NoJobsFound = ({ onCreateJob }: { onCreateJob?: () => void }) => (
  <EmptyState
    icon={<Briefcase className="w-full h-full" />}
    title="No jobs found"
    description="We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later."
    action={onCreateJob ? { label: "Post a Job", onClick: onCreateJob } : undefined}
  />
);

export const NoBusinessesFound = ({ onCreateBusiness }: { onCreateBusiness?: () => void }) => (
  <EmptyState
    icon={<Building className="w-full h-full" />}
    title="No businesses found"
    description="We couldn't find any businesses matching your search. Try different keywords or browse all businesses."
    action={onCreateBusiness ? { label: "Add Business", onClick: onCreateBusiness } : undefined}
  />
);

export const NoBookmarks = () => (
  <EmptyState
    icon={<BookmarkX className="w-full h-full" />}
    title="No bookmarks yet"
    description="Start bookmarking jobs you're interested in to build your personal collection."
  />
);

export const NoSearchResults = ({ searchTerm, onClearSearch }: { 
  searchTerm: string; 
  onClearSearch: () => void; 
}) => (
  <EmptyState
    icon={<Search className="w-full h-full" />}
    title={`No results for "${searchTerm}"`}
    description="Try adjusting your search terms or filters to find what you're looking for."
    action={{ label: "Clear Search", onClick: onClearSearch }}
  />
);

export const NoUsers = ({ onCreateUser }: { onCreateUser?: () => void }) => (
  <EmptyState
    icon={<UserX className="w-full h-full" />}
    title="No users found"
    description="No users match your current filters. Try adjusting your search criteria."
    action={onCreateUser ? { label: "Create User", onClick: onCreateUser } : undefined}
  />
);

export const NoApplications = () => (
  <EmptyState
    icon={<FileText className="w-full h-full" />}
    title="No applications yet"
    description="When you apply to jobs, they'll appear here so you can track your progress."
  />
);
