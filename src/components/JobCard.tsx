
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Briefcase, DollarSign, Clock, Heart } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks, useToggleBookmark } from "@/hooks/useBookmarks";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { JobApplicationModal } from "./JobApplicationModal";
import { useCheckExistingApplication } from "@/hooks/useApplications";

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  const { data: bookmarks = [] } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const { data: existingApplication } = useCheckExistingApplication(job.id);
  
  const isBookmarked = bookmarks.some(bookmark => bookmark.job_id === job.id);

  const handleBookmarkClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toggleBookmark.mutate({ jobId: job.id, isBookmarked });
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowApplicationModal(true);
  };

  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    } else if (job.salary_min) {
      return `$${(job.salary_min / 1000).toFixed(0)}k+`;
    }
    return "Salary not specified";
  };

  const formatPostedDate = () => {
    const postedDate = new Date(job.posted_at);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return "1 week ago";
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:border-rising-blue-200 flex flex-col h-[420px]">
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-rising-blue-600 to-rising-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-rising-blue-700 transition-colors truncate">
                    {job.title}
                  </h3>
                  <p className="text-slate-600 font-medium truncate">{job.business.name}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 flex-shrink-0" />
                  {job.job_type}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                  {formatSalary()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                  {formatPostedDate()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${
                    job.work_arrangement === 'Remote' 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : job.work_arrangement === 'Hybrid'
                      ? 'bg-rising-blue-100 text-rising-blue-700 border-rising-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {job.work_arrangement}
                </Badge>
                {job.business.values?.slice(0, 2).map((value, index) => (
                  <Badge key={index} variant="outline" className="border-slate-300 text-slate-700">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-shrink-0 ${isBookmarked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
              onClick={handleBookmarkClick}
            >
              <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 flex-1 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3 overflow-hidden">
            <p className="text-slate-700 line-clamp-3 text-sm">
              {job.description}
            </p>
            
            {job.business.culture && (
              <div className="bg-gradient-to-r from-rising-blue-50 to-rising-orange-50 rounded-lg p-3 border border-rising-blue-100">
                <div className="flex items-center mb-1">
                  <Heart className="h-3 w-3 text-rising-blue-600 mr-1.5 flex-shrink-0" />
                  <span className="font-medium text-slate-800 text-sm">Company Culture</span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-2">{job.business.culture}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {job.business.values?.slice(2, 4).map((value, index) => (
                <Badge key={index} variant="outline" className="text-xs border-slate-300 text-slate-600 truncate">
                  {value}
                </Badge>
              ))}
            </div>
            
            <div className="flex space-x-2 flex-shrink-0">
              <Link to={`/job/${job.id}`}>
                <Button variant="outline" size="sm" className="border-rising-blue-600 text-rising-blue-600 hover:bg-rising-blue-50">
                  {existingApplication ? 'View' : 'Learn More'}
                </Button>
              </Link>
              {existingApplication ? (
                <Badge className="bg-slate-500 text-white px-2 py-1 text-xs flex items-center whitespace-nowrap">
                  Applied
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-rising-blue-700 hover:bg-rising-blue-800 text-white whitespace-nowrap"
                  onClick={handleApplyClick}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <JobApplicationModal
        job={job}
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
      />
    </>
  );
};
