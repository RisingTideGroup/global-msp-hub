
import React from 'react';
import { cn } from '@/lib/utils';

// Skeleton loading component
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
);

// Spinner component
export const Spinner = ({ className, size = "default" }: { 
  className?: string; 
  size?: "sm" | "default" | "lg" 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClasses[size], className)} />
  );
};

// Loading overlay component
export const LoadingOverlay = ({ children, isLoading }: { 
  children: React.ReactNode; 
  isLoading: boolean 
}) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
        <Spinner size="lg" />
      </div>
    )}
  </div>
);

// Card skeleton for business/job listings
export const CardSkeleton = () => (
  <div className="border rounded-lg p-6 space-y-4">
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);
