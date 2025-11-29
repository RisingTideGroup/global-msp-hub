
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminClassifications, useUpdateClassificationStatus, useDeleteClassification } from "@/hooks/useClassifications";
import { useClassificationTypes } from "@/hooks/useClassificationTypes";
import { Trash2, CheckCircle, XCircle, Plus } from "lucide-react";
import { AdminTableHeader } from "@/components/AdminTableHeader";
import { AdminClassificationCreateDialog } from "@/components/AdminClassificationCreateDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const AdminClassificationTable = () => {
  const { data: classifications = [], isLoading } = useAdminClassifications();
  const { data: types = [] } = useClassificationTypes();
  const updateStatus = useUpdateClassificationStatus();
  const deleteClassification = useDeleteClassification();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredClassifications = classifications.filter(classification => {
    const matchesSearch = !searchTerm || 
      classification.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classification.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || classification.status === statusFilter;
    const matchesType = typeFilter === "all" || classification.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-rising-orange-100 text-rising-orange-700 border-rising-orange-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeFromClassification = (type: string) => {
    const foundType = types.find(t => t.name === type);
    return foundType ? foundType.use_case : [];
  };

  const getUseCaseBadges = (type: string) => {
    const useCases = getTypeFromClassification(type);
    return useCases.map(useCase => (
      <Badge key={useCase} variant="outline" className="text-xs">
        {useCase}
      </Badge>
    ));
  };

  const handleStatusChange = (classificationId: string, newStatus: 'approved' | 'rejected') => {
    updateStatus.mutate({ classificationId, status: newStatus });
  };

  const handleDelete = (classificationId: string) => {
    if (confirm('Are you sure you want to delete this classification? This action cannot be undone.')) {
      deleteClassification.mutate(classificationId);
    }
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" }
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    ...Array.from(new Set(classifications.map(c => c.type))).map(type => ({
      value: type,
      label: type
    }))
  ];

  if (isLoading) {
    return <LoadingSpinner message="Loading classifications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <AdminTableHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search classifications..."
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterPlaceholder="Filter by status"
            filterOptions={statusOptions}
          />
          <AdminTableHeader
            searchTerm=""
            onSearchChange={() => {}}
            searchPlaceholder=""
            filterValue={typeFilter}
            onFilterChange={setTypeFilter}
            filterPlaceholder="Filter by type"
            filterOptions={typeOptions}
            hideSearch
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Classification
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Use Cases</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Suggested By</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClassifications.map((classification) => (
              <TableRow key={classification.id}>
                <TableCell>
                  <div className="font-medium text-slate-800">{classification.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{classification.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {getUseCaseBadges(classification.type)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(classification.status)}</TableCell>
                <TableCell>{classification.created_by ? 'User' : 'System'}</TableCell>
                <TableCell>{new Date(classification.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {classification.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(classification.id, 'approved')}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(classification.id, 'rejected')}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(classification.id)}
                      disabled={deleteClassification.isPending}
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

      {filteredClassifications.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No classifications found matching your criteria.
        </div>
      )}

      <AdminClassificationCreateDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};
