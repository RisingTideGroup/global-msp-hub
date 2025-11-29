
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useTurnstile } from "@/hooks/useTurnstile";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: 'admin' | 'moderator' | 'user';
}

interface UserRoleManagerProps {
  user: User;
  onClose: () => void;
}

export const UserRoleManager = ({ user, onClose }: UserRoleManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>(user.role || 'user');
  const { isVerified, token, handleSuccess, handleError, reset, isBypassed } = useTurnstile();

  const updateRoleMutation = useMutation({
    mutationFn: async (newRole: 'admin' | 'moderator' | 'user') => {
      // First, delete existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      // Then insert the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: newRole
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Role updated",
        description: `User role has been updated to ${selectedRole}.`
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
      console.error("Role update error:", error);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!isVerified || !token) {
        throw new Error("Security verification required");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
        // Only include captchaToken in production
        ...(isBypassed ? {} : { captchaToken: token }),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password reset sent",
        description: "Password reset email has been sent to the user."
      });
      reset(); // Reset the turnstile after successful use
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive"
      });
      console.error("Password reset error:", error);
      reset(); // Reset the turnstile on error
    }
  });

  const handleUpdateRole = () => {
    if (selectedRole !== user.role) {
      updateRoleMutation.mutate(selectedRole as 'admin' | 'moderator' | 'user');
    } else {
      onClose();
    }
  };

  const handlePasswordReset = () => {
    if (!isVerified || !token) {
      toast({
        title: "Security Check Required",
        description: "Please complete the security check before sending password reset.",
        variant: "destructive"
      });
      return;
    }
    resetPasswordMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {user.first_name} {user.last_name}
        </h3>
        <p className="text-sm text-slate-600">{user.email}</p>
      </div>

      <div>
        <Label htmlFor="role">User Role</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Regular User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 mt-1">
          Current role: <span className="font-medium">{user.role}</span>
        </p>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Account Actions</h4>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Security Check (required for password reset)</Label>
            <TurnstileWidget 
              onSuccess={handleSuccess}
              onError={handleError}
              className="flex justify-center mt-2"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={handlePasswordReset}
            disabled={resetPasswordMutation.isPending || !isVerified}
            className="w-full"
          >
            {resetPasswordMutation.isPending ? 'Sending...' : 'Send Password Reset Email'}
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleUpdateRole}
          disabled={updateRoleMutation.isPending}
        >
          {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
        </Button>
      </div>
    </div>
  );
};
