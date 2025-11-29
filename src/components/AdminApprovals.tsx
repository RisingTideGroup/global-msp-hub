import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdminBusinesses, type AdminBusiness } from "@/hooks/useAdminBusinesses";
import { useUpdateBusinessStatus } from "@/hooks/useSharedMutations";
import { Building, CheckCircle, XCircle, Clock, Eye, MapPin, Users, Globe, Heart } from "lucide-react";
import { RichTextDisplay } from "./RichTextDisplay";

export const AdminApprovals = () => {
  const { data: businesses = [], isLoading } = useAdminBusinesses();
  const updateStatus = useUpdateBusinessStatus(['admin-businesses', 'public-businesses']);

  const pendingBusinesses = businesses.filter(business => business.status === 'pending');

  const handleApprove = (businessId: string) => {
    updateStatus.mutate({ entityId: businessId, status: 'approved' });
  };

  const handleReject = (businessId: string) => {
    updateStatus.mutate({ entityId: businessId, status: 'rejected' });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rising-blue-600 mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading pending approvals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-rising-orange-600" />
            Pending Business Approvals ({pendingBusinesses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingBusinesses.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">All caught up!</h3>
              <p className="text-slate-500">No pending business approvals at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBusinesses.map((business) => (
                <BusinessApprovalCard 
                  key={business.id} 
                  business={business} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isUpdating={updateStatus.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
    <div className="border rounded-lg p-4 bg-white">
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
              View Full Profile
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
