
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminBusinesses, useDeleteBusiness } from "@/hooks/useAdminBusinesses";
import { useUpdateBusinessStatus } from "@/hooks/useSharedMutations";
import { Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { AdminTableHeader } from "@/components/AdminTableHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";

export const AdminBusinessTable = () => {
  const { data: businesses = [], isLoading } = useAdminBusinesses();
  const updateStatus = useUpdateBusinessStatus(['admin-businesses', 'public-businesses']);
  const deleteBusiness = useDeleteBusiness();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = !searchTerm || 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || business.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dynamically generate status options based on actual data
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    ...Array.from(new Set(businesses.map(business => business.status)))
      .filter(status => status) // Remove any null/undefined values
      .sort()
      .map(status => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1)
      }))
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-rising-orange-100 text-rising-orange-700 border-rising-orange-200">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = async (businessId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    const business = businesses.find(b => b.id === businessId);
    
    updateStatus.mutate({ entityId: businessId, status: newStatus }, {
      onSuccess: async () => {
        // Send notification for approved/rejected only
        if ((newStatus === 'approved' || newStatus === 'rejected') && business) {
          try {
            const siteUrl = window.location.origin;
            
            await supabase.functions.invoke('process-notification', {
              body: {
                notificationType: newStatus === 'approved' ? 'business_approved' : 'business_rejected',
                recipientUserId: business.owner_id,
                context: {
                  business_name: business.name,
                  owner_name: 'there',
                  dashboard_link: `${siteUrl}/business`
                }
              }
            });
          } catch (error) {
            console.error('Failed to send business status notification:', error);
          }
        }
      }
    });
  };

  const handleDelete = (businessId: string) => {
    if (confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      deleteBusiness.mutate(businessId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading businesses..." />;
  }

  return (
    <div className="space-y-6">
      <AdminTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search businesses..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterPlaceholder="Filter by status"
        filterOptions={statusOptions}
      />

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Classifications</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBusinesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-slate-800">{business.name}</div>
                    {business.description && (
                      <div className="text-sm text-slate-600 line-clamp-1">{business.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{business.industry || 'N/A'}</TableCell>
                <TableCell>{business.location || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {business.business_classifications?.slice(0, 2).map((classification, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs bg-rising-blue-50 text-rising-blue-700 border-rising-blue-200"
                      >
                        {classification.classification_value}
                      </Badge>
                    ))}
                    {business.business_classifications && business.business_classifications.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{business.business_classifications.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(business.status)}</TableCell>
                <TableCell>{new Date(business.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {business.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(business.id, 'approved')}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(business.id, 'rejected')}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                    {business.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(business.id, 'pending')}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        Reset
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(business.id)}
                      disabled={deleteBusiness.isPending}
                      className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
