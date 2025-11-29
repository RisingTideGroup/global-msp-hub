import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminClassificationTypes, useUpdateClassificationTypeStatus, useDeleteClassificationType } from "@/hooks/useClassificationTypes";
import { Trash2, CheckCircle, XCircle, Plus, Users, Shield, Edit } from "lucide-react";
import { AdminTableHeader } from "@/components/AdminTableHeader";
import { AdminClassificationTypeCreateDialog } from "@/components/AdminClassificationTypeCreateDialog";
import { AdminClassificationTypeEditDialog } from "@/components/AdminClassificationTypeEditDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ClassificationType } from "@/hooks/useClassificationTypes";

export const AdminClassificationTypesTable = () => {
  const { data: types = [], isLoading } = useAdminClassificationTypes();
  const updateStatus = useUpdateClassificationTypeStatus();
  const deleteType = useDeleteClassificationType();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<ClassificationType | null>(null);

  const filteredTypes = types.filter(type => {
    const matchesSearch = !searchTerm || 
      type.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || type.status === statusFilter;

    return matchesSearch && matchesStatus;
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

  const getUseCaseBadges = (useCases: string[]) => {
    return useCases.map(useCase => (
      <Badge key={useCase} variant="outline" className="text-xs">
        {useCase}
      </Badge>
    ));
  };

  const getUserSuggestionBadge = (allowUserSuggestions: boolean) => {
    if (allowUserSuggestions) {
      return (
        <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
          <Users className="h-3 w-3 mr-1" />
          User Suggestions
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
          <Shield className="h-3 w-3 mr-1" />
          Admin Only
        </Badge>
      );
    }
  };

  const handleStatusChange = (typeId: string, newStatus: 'approved' | 'rejected') => {
    updateStatus.mutate({ typeId, status: newStatus });
  };

  const handleDelete = (typeId: string) => {
    if (confirm('Are you sure you want to delete this classification type? This action cannot be undone.')) {
      deleteType.mutate(typeId);
    }
  };

  const handleEdit = (type: ClassificationType) => {
    setSelectedType(type);
    setShowEditDialog(true);
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" }
  ];

  if (isLoading) {
    return <LoadingSpinner message="Loading classification types..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AdminTableHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search classification types..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterPlaceholder="Filter by status"
          filterOptions={statusOptions}
        />
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Classification Type
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Field Type</TableHead>
              <TableHead>Use Cases</TableHead>
              <TableHead>User Suggestions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Suggested By</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  <div className="font-medium text-slate-800">{type.name}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {type.field_type === 'text' ? 'Text Input' : 'Select'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {getUseCaseBadges(type.use_case)}
                  </div>
                </TableCell>
                <TableCell>
                  {getUserSuggestionBadge(type.allow_user_suggestions)}
                </TableCell>
                <TableCell>{getStatusBadge(type.status)}</TableCell>
                <TableCell>{type.created_by ? 'User' : 'System'}</TableCell>
                <TableCell>{new Date(type.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(type)}
                      className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    {type.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(type.id, 'approved')}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(type.id, 'rejected')}
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
                      onClick={() => handleDelete(type.id)}
                      disabled={deleteType.isPending}
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

      {filteredTypes.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No classification types found matching your criteria.
        </div>
      )}

      <AdminClassificationTypeCreateDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />

      <AdminClassificationTypeEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        classificationType={selectedType}
      />
    </div>
  );
};
