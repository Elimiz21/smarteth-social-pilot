import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Trash2, Check, X, User, Mail, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const rolePermissions = {
  "owner": {
    color: "destructive" as const,
    permissions: ["All Permissions"]
  },
  "admin": {
    color: "default" as const,
    permissions: ["User Management", "Content Management", "Analytics", "Settings"]
  },
  "marketer": {
    color: "default" as const,
    permissions: ["Create Content", "Schedule Posts", "View Analytics", "Manage Campaigns"]
  },
  "analyst": {
    color: "secondary" as const,
    permissions: ["View Analytics", "Export Data", "Generate Reports"]
  },
  "content_creator": {
    color: "outline" as const,
    permissions: ["Create Content", "Upload Media", "Edit Posts"]
  },
  "user": {
    color: "outline" as const,
    permissions: ["View Content", "View Analytics (Read-only)"]
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'owner') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string, userEmail: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Send confirmation email
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: userEmail,
          userEmail,
          userName,
          status: 'approved'
        }
      });

      toast({
        title: "User approved",
        description: "User has been approved and notification sent",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (userId: string, userEmail: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) throw error;

      // Send rejection email
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: userEmail,
          userEmail,
          userName,
          status: 'rejected'
        }
      });

      toast({
        title: "User rejected",
        description: "User has been rejected and notification sent",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: "User deleted",
        description: "User has been permanently deleted",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const roleConfig = rolePermissions[role as keyof typeof rolePermissions];
    return roleConfig?.color || "default";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "approved": "default",
      "pending": "secondary", 
      "rejected": "outline"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatLastLogin = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (profile?.role !== 'owner') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>Only the owner can access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage team members and their permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="relative">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('') : user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 flex-1">
                <p className="text-sm font-medium leading-none">{user.full_name || 'No Name'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              
              {user.status === 'pending' ? (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveUser(user.id, user.email, user.full_name || user.email)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectUser(user.id, user.email, user.full_name || user.email)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateUserRole(user.id, user.role === 'user' ? 'admin' : 'user')}>
                      <Shield className="mr-2 h-4 w-4" />
                      {user.role === 'user' ? 'Make Admin' : 'Make User'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete this user? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                {getStatusBadge(user.status)}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Created: {formatLastLogin(user.created_at)}</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {(rolePermissions[user.role as keyof typeof rolePermissions]?.permissions || []).slice(0, 2).map((permission: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {(rolePermissions[user.role as keyof typeof rolePermissions]?.permissions || []).length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{(rolePermissions[user.role as keyof typeof rolePermissions]?.permissions || []).length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Reference</CardTitle>
          <CardDescription>
            Overview of what each role can access and do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(rolePermissions).map(([role, config]) => (
              <div key={role} className="space-y-2">
                <Badge variant={config.color} className="mb-2">
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
                <ul className="text-sm space-y-1">
                  {config.permissions.map((permission, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {permission}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;