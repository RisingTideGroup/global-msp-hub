import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Briefcase, Clock, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import type { PublicJob } from "@/hooks/usePublicJobs";

interface PublicJobCardProps {
  job: PublicJob;
}

export const PublicJobCard = ({ job }: PublicJobCardProps) => {
  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Posted today";
    if (diffDays <= 7) return `Posted ${diffDays} days ago`;
    return `Posted ${date.toLocaleDateString()}`;
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-brand-primary">
      <CardHeader className="flex-1 p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-heading-primary line-clamp-2 mb-1 break-words">
                {job.title}
              </h3>
              <p className="text-sm sm:text-base text-dark-text font-medium break-words">{job.business.name}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-dark-text mb-3 sm:mb-4">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-accent flex-shrink-0" />
            <span className="break-words">{job.location}</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-accent flex-shrink-0" />
            {job.job_type}
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-accent flex-shrink-0" />
            {formatPostedDate(job.posted_at)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              job.work_arrangement === 'Remote' 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : job.work_arrangement === 'Hybrid'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            {job.work_arrangement}
          </Badge>
          {job.business.industry && (
            <Badge variant="outline" className="border-brand-primary/30 text-brand-primary text-xs">
              {job.business.industry}
            </Badge>
          )}
        </div>

        <p className="text-dark-text line-clamp-3 text-xs sm:text-sm break-words">
          {job.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to={`/job/${job.id}`} className="flex-1">
            <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 min-h-[44px]">
              View Details
            </Button>
          </Link>
          <Link to="/auth" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto flex items-center gap-1 justify-center min-h-[44px]">
              <Lock className="h-4 w-4" />
              <span className="sm:inline">Sign In</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};