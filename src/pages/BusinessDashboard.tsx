import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Edit, Eye, Users, BarChart3, Settings, Briefcase, Trash2, AlertTriangle, Bot, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusiness, useUpdateBusiness } from "@/hooks/useBusiness";
import { useBusinessJobs, useCreateJob, type BusinessJobsJob } from "@/hooks/useBusinessJobs";
import { useBusinessApplications } from "@/hooks/useBusinessApplications";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessEditForm } from "@/components/BusinessEditForm";
import { BusinessDeleteDialog } from "@/components/BusinessDeleteDialog";
import { BusinessCreateModal } from "@/components/BusinessCreateModal";
import { JobEditModal } from "@/components/JobEditModal";
import { JobDeleteDialog } from "@/components/JobDeleteDialog";
import { JobForm } from "@/components/JobForm";
import { Footer } from "@/components/Footer";
import { RichTextDisplay } from "@/components/RichTextDisplay";
import { AIAssistantManager } from "@/components/AIAssistantManager";
import { BusinessApplicationsTable } from "@/components/BusinessApplicationsTable";
import { BusinessAnalytics } from "@/components/BusinessAnalytics";

const BusinessDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: business, isLoading: businessLoading } = useBusiness();
  const { data: jobs = [], isLoading: jobsLoading } = useBusinessJobs();
  const { data: applications = [] } = useBusinessApplications(business?.id);
  const createJob = useCreateJob();
  
  const [showJobForm, setShowJobForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<BusinessJobsJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<BusinessJobsJob | null>(null);

  // Show create modal for draft businesses or when no business exists
  const shouldShowCreateModal = !businessLoading && (!business || business.status === 'draft');

  const handleJobFormSubmit = async (formData: any) => {
    if (!business) {
      toast({
        title: "Business Required",
        description: "Please create a business profile first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createJob.mutateAsync({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        job_type: formData.job_type,
        work_arrangement: formData.work_arrangement,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        benefits: formData.benefits,
        business_id: business.id
      });

      setShowJobForm(false);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access the business dashboard.</p>
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (businessLoading || jobsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show create modal immediately for draft or missing business
  if (shouldShowCreateModal) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <Footer />
        </div>
        <BusinessCreateModal 
          open={true} 
          onOpenChange={(open) => {
            if (!open) {
              // If they close the modal without completing, redirect to home
              navigate('/');
            }
          }}
          business={business} // Pass the draft business data
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{business?.name.charAt(0) || 'B'}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{business?.name}</h1>
                <p className="text-sm text-gray-600">Business Dashboard</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Profile
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Business Profile
            </TabsTrigger>
            <TabsTrigger 
              value="jobs"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Jobs
            </TabsTrigger>
            <TabsTrigger 
              value="applications"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Applications
              {applications.length > 0 && (
                <Badge className="ml-2" variant="secondary">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="ai"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
              <div className="flex space-x-3">
                <Button onClick={() => setShowEditForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  onClick={() => setShowDeleteDialog(true)} 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Business
                </Button>
              </div>
            </div>

            {business?.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Pending Approval</h4>
                    <p className="text-sm text-yellow-700">Your business profile is pending approval and not visible publicly yet.</p>
                  </div>
                </div>
              </div>
            )}

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Company Name</Label>
                    <Input value={business?.name || ''} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Input value={business?.industry || ''} className="mt-1" readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Company Size</Label>
                    <Input value={business?.company_size || ''} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={business?.location || ''} className="mt-1" readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Website</Label>
                    <Input value={business?.website || ''} className="mt-1" readOnly />
                  </div>
                  <div>
                    <Label>Careers Page URL</Label>
                    <Input value={business?.careers_page_url || ''} className="mt-1" readOnly />
                  </div>
                </div>

                {business?.logo_url && (
                  <div>
                    <Label>Company Logo</Label>
                    <div className="mt-2">
                      <img 
                        src={business.logo_url} 
                        alt="Company logo" 
                        className="w-16 h-16 rounded-lg object-cover border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label>Company Description</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                    <RichTextDisplay 
                      content={business?.description_rich || ""} 
                      fallback={business?.description || ""} 
                      className="text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label>Mission Statement</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                    <RichTextDisplay 
                      content={business?.mission_rich || ""} 
                      fallback={business?.mission || ""} 
                      className="text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label>Company Culture</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                    <RichTextDisplay 
                      content={business?.culture_rich || ""} 
                      fallback={business?.culture || ""} 
                      className="text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label>Core Values</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {business?.values?.map((value, index) => (
                      <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Add Classifications Section */}
                {business?.business_classifications && business.business_classifications.length > 0 && (
                  <div>
                    <Label>Classifications</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {business.business_classifications.map((classification, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-rising-blue-50 text-rising-blue-700 border-rising-blue-200"
                        >
                          <span className="text-xs text-gray-500 mr-1">{classification.classification_type}:</span>
                          {classification.classification_value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Benefits & Perks</Label>
                  <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                    <RichTextDisplay 
                      content={business?.benefits_rich || ""} 
                      fallback={business?.benefits || ""} 
                      className="text-slate-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
              <Button 
                onClick={() => setShowJobForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </div>

            {showJobForm && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Create New Job Posting</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobForm
                    onSubmit={handleJobFormSubmit}
                    onCancel={() => setShowJobForm(false)}
                    isLoading={createJob.isPending}
                    submitText="Post Job"
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.job_type}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                          <span>{job.location}</span>
                        </div>
                      </div>
                       <div className="flex items-center space-x-3">
                         <Badge 
                           variant="outline" 
                           className={job.is_active 
                             ? "border-green-200 text-green-700 bg-green-50" 
                             : "border-gray-300 text-gray-500 bg-gray-100"
                           }
                         >
                           {job.is_active ? 'Active' : 'Inactive'}
                         </Badge>
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => setEditingJob(job)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => setDeletingJob(job)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-5 w-5" />
                    Job Applications
                  </div>
                  <Badge variant="secondary">
                    {applications.length} Total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600">
                      Once candidates apply to your job postings, you'll see their applications here.
                    </p>
                  </div>
                ) : (
                  <BusinessApplicationsTable applications={applications} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {business && <BusinessAnalytics businessId={business.id} />}
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Business Coach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIAssistantManager businessId={business?.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Edit Form Modal */}
      {showEditForm && (
        <BusinessEditForm
          business={business}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <BusinessDeleteDialog
          businessName={business?.name || ''}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => {
            setShowDeleteDialog(false);
            navigate('/');
          }}
        />
      )}

      {/* Job Edit Modal */}
      {editingJob && (
        <JobEditModal
          job={editingJob}
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
          businessId={business?.id}
        />
      )}

      {/* Job Delete Dialog */}
      {deletingJob && (
        <JobDeleteDialog
          job={deletingJob}
          onClose={() => setDeletingJob(null)}
          onSuccess={() => setDeletingJob(null)}
        />
      )}
    </div>
  );
};

export default BusinessDashboard;
