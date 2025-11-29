
interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  message = "Loading...", 
  className = "" 
}: LoadingSpinnerProps) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rising-blue-600 mx-auto"></div>
      <p className="text-slate-600 mt-4">{message}</p>
    </div>
  );
};
