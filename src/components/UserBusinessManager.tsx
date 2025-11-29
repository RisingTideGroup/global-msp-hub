import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BusinessEditForm } from "./BusinessEditForm";
import { Edit, Trash, Plus } from "lucide-react";
import { BaseBusiness } from "@/types/shared";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Business extends BaseBusiness {}

interface UserBusinessManagerProps {
  user: User;
  onClose: () => void;
}

export const UserBusinessManager = ({ user, onClose }: UserBusinessManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: businesses = [], isLoading, refetch } = useQuery({
    queryKey: ['user-businesses', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const deleteBusinessMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-businesses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Business deleted",
        description: "Business has been permanently removed."
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete business",
        variant: "destructive"
      });
      console.error("Business deletion error:", error);
    }
  });

  const handleDeleteBusiness = (businessId: string) => {
    if (confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      deleteBusinessMutation.mutate(businessId);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rising-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Businesses owned by {user.first_name} {user.last_name}
        </h3>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>

      {businesses.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell className="font-medium">{business.name}</TableCell>
                  <TableCell>{business.industry || 'Not specified'}</TableCell>
                  <TableCell>{business.location || 'Not specified'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(business.status)}>
                      {business.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(business.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={showEditDialog && selectedBusiness?.id === business.id} onOpenChange={(open) => {
                        setShowEditDialog(open);
                        if (!open) setSelectedBusiness(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Business</DialogTitle>
                          </DialogHeader>
                          {selectedBusiness && (
                            <BusinessEditForm
                              business={selectedBusiness}
                              onClose={() => {
                                setShowEditDialog(false);
                                setSelectedBusiness(null);
                                refetch();
                              }}
                              onSuccess={() => {
                                setShowEditDialog(false);
                                setSelectedBusiness(null);
                                refetch();
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteBusinessMutation.isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          This user has no businesses registered.
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};
