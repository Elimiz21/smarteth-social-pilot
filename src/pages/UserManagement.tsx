import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck,
  Settings,
  Mail,
  Calendar,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockUsers = [
  {
    id: 1,
    name: "Eli Cohen",
    email: "eli@silvercl.com",
    role: "Owner",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    avatar: null,
    permissions: ["all"]
  },
  {
    id: 2,
    name: "Sarah Marketing",
    email: "sarah@silvercl.com", 
    role: "Marketer",
    status: "active",
    lastLogin: "2024-01-15T09:15:00Z",
    avatar: null,
    permissions: ["content", "scheduling", "analytics"]
  },
  {
    id: 3,
    name: "David Analyst", 
    email: "david@silvercl.com",
    role: "Analyst",
    status: "active",
    lastLogin: "2024-01-14T16:45:00Z",
    avatar: null,
    permissions: ["analytics", "content_draft"]
  }
];

const rolePermissions = {
  Owner: {
    color: "default",
    permissions: ["Full system access", "User management", "Integration settings", "Strategy editing", "Compliance settings", "GitHub export"]
  },
  Marketer: {
    color: "secondary", 
    permissions: ["Content generation", "Content editing", "Content approval", "Post scheduling", "Analytics viewing"]
  },
  Analyst: {
    color: "outline",
    permissions: ["Content drafting", "Analytics viewing", "Report generation"]
  }
};

export default function UserManagement() {
  const [showAddUser, setShowAddUser] = useState(false);

  const getRoleBadgeVariant = (role: string): "default" | "destructive" | "outline" | "secondary" => {
    const color = rolePermissions[role as keyof typeof rolePermissions]?.color;
    if (color === "default" || color === "secondary" || color === "outline") {
      return color;
    }
    return "outline";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage team access and permissions for SmartEth marketing platform
          </p>
        </div>
        <Button variant="hero" onClick={() => setShowAddUser(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* User List */}
      <div className="grid grid-cols-1 gap-6">
        {mockUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-card-hover transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last login: {formatLastLogin(user.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <UserCheck className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Permissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {rolePermissions[user.role as keyof typeof rolePermissions]?.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New User
            </CardTitle>
            <CardDescription>
              Invite a new team member to the SmartEth marketing platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" placeholder="user@silvercl.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select defaultValue="analyst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">Analyst - View analytics and draft content</SelectItem>
                  <SelectItem value="marketer">Marketer - Generate, edit, and schedule content</SelectItem>
                  <SelectItem value="owner" disabled>Owner - Full access (Owner only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="hero">
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
              <Button variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permissions Reference
          </CardTitle>
          <CardDescription>
            Understanding access levels for each user role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(rolePermissions).map(([role, config]) => (
            <div key={role} className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={config.color as "default" | "destructive" | "outline" | "secondary"}>{role}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {config.permissions.map((permission) => (
                  <div key={permission} className="text-sm text-muted-foreground">
                    • {permission}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}