
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdminBusinesses, type AdminBusiness } from "@/hooks/useAdminBusinesses";
import { useUpdateBusinessStatus } from "@/hooks/useSharedMutations";
import { useGDPRDeletions, type GDPRDeletion } from "@/hooks/useGDPRDeletion";
import { Building, CheckCircle, XCircle, Clock, Eye, MapPin, Users, Globe, Heart, Trash2, AlertTriangle, User } from "lucide-react";
import { RichTextDisplay } from "./RichTextDisplay";
import { LoadingSpinner } from "./LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const AdminDashboard = () => {
  const { data: businesses = [], isLoading: businessesLoading } = useAdminBusinesses();
  const { data: gdprRequests = [], isLoading: gdprLoading } = useGDPRDeletions();
  const updateBusinessStatus = useUpdateBusinessStatus(['admin-businesses', 'public-businesses']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pendingBusinesses = businesses.filter(business => business.status === 'pending');
  const pendingGDPRRequests = gdprRequests.filter(request => request.status === 'pending');

  const handleApproveGDPR = async (requestId: string) => {
    try {
      toast({
        title: "Processing...",
        description: "Deleting user data. This may take a moment.",
      });

      // Call edge function to perform the actual deletion
      const { data, error } = await supabase.functions.invoke('process-gdpr-deletion', {
        body: { requestId }
      });

      if (error) throw error;

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['gdpr-deletions'] });

      toast({
        title: "GDPR Request Approved",
        description: "User account and all associated data have been permanently deleted.",
      });

      console.log('GDPR deletion completed:', data);
      
    } catch (error) {
      console.error('Error approving GDPR request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process GDPR deletion",
        variant: "destructive",
      });
    }
  };

  const handleRejectGDPR = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('gdpr_deletions')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['gdpr-deletions'] });

      toast({
        title: "GDPR Request Rejected",
        description: "The data deletion request has been rejected.",
      });
      
      console.log('GDPR deletion rejected:', requestId);
    } catch (error) {
      console.error('Error rejecting GDPR request:', error);
      toast({
        title: "Error",
        description: "Failed to reject GDPR request",
        variant: "destructive",
      });
    }
  };

  const handleApproveBusiness = (businessId: string) => {
    updateBusinessStatus.mutate({ entityId: businessId, status: 'approved' });
  };

  const handleRejectBusiness = (businessId: string) => {
    updateBusinessStatus.mutate({ entityId: businessId, status: 'rejected' });
  };

  if (businessesLoading || gdprLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  const totalPending = pendingBusinesses.length + pendingGDPRRequests.length;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Requires your attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Approvals</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBusinesses.length}</div>
            <p className="text-xs text-muted-foreground">
              Business profiles to review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDPR Requests</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGDPRRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Data deletion requests
            </p>
          </CardContent>
        </Card>
      </div>

      {totalPending === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">All caught up!</h3>
            <p className="text-slate-500 text-lg">No pending approvals at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Pending Business Approvals */}
          {pendingBusinesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-rising-blue-600" />
                  Pending Business Approvals ({pendingBusinesses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBusinesses.map((business) => (
                    <BusinessApprovalCard 
                      key={business.id} 
                      business={business} 
                      onApprove={handleApproveBusiness}
                      onReject={handleRejectBusiness}
                      isUpdating={updateBusinessStatus.isPending}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending GDPR Requests */}
          {pendingGDPRRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Pending GDPR Deletion Requests ({pendingGDPRRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingGDPRRequests.map((request) => (
                    <GDPRRequestCard 
                      key={request.id} 
                      request={request} 
                      onApprove={handleApproveGDPR}
                      onReject={handleRejectGDPR}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

interface BusinessApprovalCardProps {
  business: AdminBusiness;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isUpdating: boolean;
}

const BusinessApprovalCard = ({ business, onApprove, onReject, isUpdating }: BusinessApprovalCardProps) => {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {business.logo_url ? (
            <img 
              src={business.logo_url} 
              alt={`${business.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-rising-blue-600 to-rising-orange-600 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h4 className="text-lg font-semibold text-slate-800">{business.name}</h4>
            <p className="text-slate-600">{business.industry} • {business.location}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-rising-orange-600 border-rising-orange-200">
          Pending Review
        </Badge>
      </div>

      {(business.description_rich || business.description) && (
        <div className="mb-4">
          <RichTextDisplay 
            content={business.description_rich || ""} 
            fallback={business.description || ""} 
            className="text-slate-700 line-clamp-2" 
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {business.company_size && (
          <Badge variant="secondary">{business.company_size}</Badge>
        )}
        {business.values?.slice(0, 3).map((value, index) => (
          <Badge key={index} variant="outline">{value}</Badge>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-4">
                {business.logo_url ? (
                  <img 
                    src={business.logo_url} 
                    alt={`${business.name} logo`}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-rising-blue-600 to-rising-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building className="h-10 w-10 text-white" />
                  </div>
                )}
                <div>
                  <DialogTitle className="text-3xl font-bold text-slate-800 mb-2">
                    {business.name}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2">
                    {business.industry && (
                      <Badge variant="secondary">{business.industry}</Badge>
                    )}
                    {business.company_size && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {business.company_size}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-rising-orange-600 border-rising-orange-200">
                      {business.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {business.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{business.location}</span>
                </div>
              )}

              {(business.description_rich || business.description) && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">About</h3>
                  <RichTextDisplay 
                    content={business.description_rich || ""} 
                    fallback={business.description || ""} 
                    className="text-slate-600 leading-relaxed" 
                  />
                </div>
              )}

              {(business.mission_rich || business.mission) && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Mission</h3>
                  <RichTextDisplay 
                    content={business.mission_rich || ""} 
                    fallback={business.mission || ""} 
                    className="text-slate-600 leading-relaxed" 
                  />
                </div>
              )}

              {(business.culture_rich || business.culture) && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Culture</h3>
                  <RichTextDisplay 
                    content={business.culture_rich || ""} 
                    fallback={business.culture || ""} 
                    className="text-slate-600 leading-relaxed" 
                  />
                </div>
              )}

              {business.values && business.values.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-rising-orange-600" />
                    <h3 className="text-xl font-semibold text-slate-800">Values</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {business.values.map((value, index) => (
                      <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(business.benefits_rich || business.benefits) && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">Benefits</h3>
                  <RichTextDisplay 
                    content={business.benefits_rich || ""} 
                    fallback={business.benefits || ""} 
                    className="text-slate-600 leading-relaxed" 
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                {business.website && (
                  <div>
                    <strong>Website:</strong> 
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-rising-blue-600 hover:underline ml-1">
                      {business.website}
                    </a>
                  </div>
                )}
                {business.careers_page_url && (
                  <div>
                    <strong>Careers:</strong> 
                    <a href={business.careers_page_url} target="_blank" rel="noopener noreferrer" className="text-rising-blue-600 hover:underline ml-1">
                      {business.careers_page_url}
                    </a>
                  </div>
                )}
                <div><strong>Created:</strong> {new Date(business.created_at).toLocaleDateString()}</div>
                <div><strong>Updated:</strong> {new Date(business.updated_at).toLocaleDateString()}</div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => onReject(business.id)}
                  disabled={isUpdating}
                  className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => onApprove(business.id)}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onReject(business.id)}
            disabled={isUpdating}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => onApprove(business.id)}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};

interface GDPRRequestCardProps {
  request: GDPRDeletion;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const GDPRRequestCard = ({ request, onApprove, onReject }: GDPRRequestCardProps) => {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow border-l-4 border-l-red-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Data Deletion Request</h4>
            <p className="text-slate-600">{request.email || 'No email provided'}</p>
            <p className="text-sm text-slate-500">
              Requested on {new Date(request.deletion_requested_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
          GDPR Request
        </Badge>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Important Notice</p>
            <p className="text-sm text-yellow-700">
              Approving this request will permanently delete all user data. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
        <div><strong>User ID:</strong> {request.user_id}</div>
        <div><strong>Status:</strong> {request.status}</div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onReject(request.id)}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Reject Request
        </Button>
        <Button
          variant="destructive"
          onClick={() => onApprove(request.id)}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Approve Deletion
        </Button>
      </div>
    </div>
  );
};
