
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, Briefcase, DollarSign, Clock, ArrowLeft, Heart } from "lucide-react";
import { Job } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks, useToggleBookmark } from "@/hooks/useBookmarks";
import { useState } from "react";
import { JobApplicationModal } from "@/components/JobApplicationModal";
import { RichTextDisplay } from "@/components/RichTextDisplay";
import { useVisitTracking } from "@/hooks/useVisitTracking";
import { useCheckExistingApplication, useCancelApplication } from "@/hooks/useApplications";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const { data: bookmarks = [] } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const { data: existingApplication, isLoading: checkingApplication } = useCheckExistingApplication(id);
  const cancelApplication = useCancelApplication();

  // Track job visit
  useVisitTracking('job', id);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          business:businesses (
            id,
            name,
            description,
            description_rich,
            culture,
            culture_rich,
            values,
            industry,
            location,
            business_classifications (
              classification_type,
              classification_value
            )
          ),
          job_classifications (
            classification_type,
            classification_value
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error || !data) throw error || new Error('Job not found');
      return data as Job;
    },
    enabled: !!id
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error || !job) return <div className="p-8">Job not found</div>;

  const isBookmarked = bookmarks.some(bookmark => bookmark.job_id === job.id);

  const handleBookmarkClick = () => {
    if (!user) return;
    toggleBookmark.mutate({ jobId: job.id, isBookmarked });
  };

  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      return `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`;
    } else if (job.salary_min) {
      return `$${(job.salary_min / 1000).toFixed(0)}k+`;
    }
    return "Salary not specified";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-rising-blue-50 to-rising-orange-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-rising-blue-700 hover:text-rising-blue-800 mb-4 sm:mb-6 text-sm sm:text-base">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>

          <div className="grid gap-4 sm:gap-6">
            {/* Job Header */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-rising-blue-600 to-rising-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl text-slate-800 break-words">{job.title}</CardTitle>
                      <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium mt-1">{job.business.name}</p>
                    </div>
                  </div>
                  {user && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`${isBookmarked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'} min-h-[44px] min-w-[44px]`}
                      onClick={handleBookmarkClick}
                    >
                      <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base text-slate-600 mt-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="break-words">{job.location}</span>
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
                    Posted {new Date(job.posted_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
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
                  
                  {/* Business Values */}
                  {job.business.values?.map((value, index) => (
                    <Badge key={index} variant="outline" className="border-slate-300 text-slate-700">
                      {value}
                    </Badge>
                  ))}
                  
                  {/* Job Classifications */}
                  {job.job_classifications?.map((classification, index) => (
                    <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                      {classification.classification_value}
                    </Badge>
                  ))}
                  
                  {/* Business Classifications */}
                  {job.business.business_classifications?.map((classification, index) => (
                    <Badge key={index} variant="outline" className="border-orange-300 text-orange-700">
                      {classification.classification_value}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                  {existingApplication ? (
                    <>
                      <Button 
                        size="lg" 
                        className="bg-slate-500 hover:bg-slate-600 text-white min-h-[48px] w-full sm:w-auto cursor-not-allowed"
                        disabled
                      >
                        Application {existingApplication.status}
                      </Button>
                      <Button 
                        size="lg" 
                        variant="destructive"
                        className="min-h-[48px] w-full sm:w-auto"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        Cancel Application
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        className="bg-rising-blue-700 hover:bg-rising-blue-800 text-white min-h-[48px] w-full sm:w-auto"
                        onClick={() => setShowApplicationModal(true)}
                        disabled={!user}
                      >
                        {user ? 'Apply Now' : 'Sign in to Apply'}
                      </Button>
                      {!user && (
                        <Link to="/auth" className="w-full sm:w-auto">
                          <Button variant="outline" size="lg" className="min-h-[48px] w-full">
                            Sign In
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <RichTextDisplay 
                  content={job.description_rich || job.description} 
                  fallback={job.description}
                  className="text-slate-700 text-sm sm:text-base"
                />
              </CardContent>
            </Card>

            {/* Requirements */}
            {(job.requirements || job.requirements_rich) && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <RichTextDisplay 
                    content={job.requirements_rich || job.requirements || ""} 
                    fallback={job.requirements || ""}
                    className="text-slate-700 text-sm sm:text-base"
                  />
                </CardContent>
              </Card>
            )}

            {/* Company Culture - Only for authenticated users */}
            {user && (job.business.culture || job.business.culture_rich) && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Company Culture</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <RichTextDisplay 
                    content={job.business.culture_rich || job.business.culture || ""} 
                    fallback={job.business.culture || ""}
                    className="text-slate-700 text-sm sm:text-base"
                  />
                </CardContent>
              </Card>
            )}

            {/* Login prompt for additional details */}
            {!user && (
              <Card className="border-2 border-dashed border-brand-primary/30">
                <CardContent className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <Building className="h-8 w-8 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-heading-primary mb-2">
                        Want to learn more about this company?
                      </h3>
                      <p className="text-dark-text mb-4">
                        Sign in to see company culture, detailed benefits, and more insights.
                      </p>
                      <Link to="/auth">
                        <Button className="bg-brand-primary hover:bg-brand-primary/90">
                          Sign In to See More
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {(job.benefits || job.benefits_rich) && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Benefits</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <RichTextDisplay 
                    content={job.benefits_rich || job.benefits || ""} 
                    fallback={job.benefits || ""}
                    className="text-slate-700 text-sm sm:text-base"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <JobApplicationModal
        job={job}
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your application for this position? 
              This action cannot be undone, but you can reapply later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Application</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (existingApplication) {
                  cancelApplication.mutate(existingApplication.id);
                }
                setShowCancelDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default JobDetails;
