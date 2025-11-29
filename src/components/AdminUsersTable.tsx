
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminTableHeader } from "./AdminTableHeader";
import { AdminUserCreateDialog } from "./AdminUserCreateDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserRoleManager } from "./UserRoleManager";
import { UserBusinessManager } from "./UserBusinessManager";
import { Users, Shield, Building, Trash, Plus } from "lucide-react";

type UserRole = 'admin' | 'moderator' | 'user';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  role?: UserRole;
  business_count?: number;
}

export const AdminUsersTable = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter],
    queryFn: async () => {
      console.log('Fetching users with filters:', { searchTerm, roleFilter });
      const startTime = performance.now();
      
      // Build the query for profiles with user roles
      let profilesQuery = supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          created_at,
          business_id
        `);

      // Apply search filter if provided
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        profilesQuery = profilesQuery.or(`
          email.ilike.%${searchTerm}%,
          first_name.ilike.%${searchTerm}%,
          last_name.ilike.%${searchTerm}%,
          id.ilike.%${searchTerm}%
        `);
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;
      
      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        throw profilesError;
      }

      if (!profilesData || profilesData.length === 0) {
        return [];
      }

      // Get user IDs from profiles
      const userIds = profilesData.map(profile => profile.id);

      // Get user roles for these users
      let rolesQuery = supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Add role filter if specified and not 'all'
      if (roleFilter !== 'all') {
        rolesQuery = rolesQuery.eq('role', roleFilter as UserRole);
      }

      const { data: rolesData, error: rolesError } = await rolesQuery;
      
      if (rolesError) {
        console.error('Roles query error:', rolesError);
        throw rolesError;
      }

      // Get business counts for these users
      const { data: businessCounts, error: businessError } = await supabase
        .from('businesses')
        .select('owner_id')
        .in('owner_id', userIds);

      if (businessError) {
        console.error('Business count error:', businessError);
        throw businessError;
      }

      // Count businesses per user
      const businessCountMap = new Map<string, number>();
      businessCounts?.forEach(business => {
        const count = businessCountMap.get(business.owner_id) || 0;
        businessCountMap.set(business.owner_id, count + 1);
      });

      // Create role map
      const roleMap = new Map<string, Set<UserRole>>();
      rolesData?.forEach(role => {
        if (!roleMap.has(role.user_id)) {
          roleMap.set(role.user_id, new Set());
        }
        roleMap.get(role.user_id)?.add(role.role as UserRole);
      });

      // Transform profiles data with roles and business counts
      const transformedUsers = profilesData
        .filter(profile => {
          // If role filter is applied, only include users who have roles
          if (roleFilter !== 'all') {
            return roleMap.has(profile.id);
          }
          return true;
        })
        .map(profile => {
          const userRoles = roleMap.get(profile.id) || new Set();
          
          // Determine highest priority role
          let finalRole: UserRole = 'user';
          if (userRoles.has('admin')) {
            finalRole = 'admin';
          } else if (userRoles.has('moderator')) {
            finalRole = 'moderator';
          }

          return {
            id: profile.id,
            email: profile.email || 'No email',
            first_name: profile.first_name || 'Unknown',
            last_name: profile.last_name || 'User',
            created_at: profile.created_at || new Date().toISOString(),
            role: finalRole,
            business_count: businessCountMap.get(profile.id) || 0
          };
        });

      const endTime = performance.now();
      console.log(`Query took ${endTime - startTime} milliseconds`);
      console.log('Transformed users:', transformedUsers.length);
      return transformedUsers;
    },
    staleTime: 30000,
  });

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete related data
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.from('businesses').delete().eq('owner_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);
      
      toast({
        title: "User deleted",
        description: "User and all related data have been removed."
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const filterOptions = [
    { value: "all", label: "All Users" },
    { value: "admin", label: "Admins" },
    { value: "moderator", label: "Moderators" },
    { value: "user", label: "Regular Users" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rising-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AdminTableHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search users by name, email, or ID..."
          filterValue={roleFilter}
          onFilterChange={setRoleFilter}
          filterPlaceholder="Filter by role"
          filterOptions={filterOptions}
        />
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Businesses</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                  <div className="text-xs text-slate-400 font-mono">{user.id}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'default' : 'secondary'}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.business_count}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={showRoleDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setShowRoleDialog(open);
                      if (!open) setSelectedUser(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage User Role</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <UserRoleManager 
                            user={selectedUser} 
                            onClose={() => {
                              setShowRoleDialog(false);
                              setSelectedUser(null);
                              refetch();
                            }} 
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showBusinessDialog && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setShowBusinessDialog(open);
                      if (!open) setSelectedUser(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Building className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Manage User Businesses</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <UserBusinessManager 
                            user={selectedUser} 
                            onClose={() => {
                              setShowBusinessDialog(false);
                              setSelectedUser(null);
                              refetch();
                            }} 
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
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

      {users.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No users found matching your criteria.
        </div>
      )}

      <AdminUserCreateDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};
