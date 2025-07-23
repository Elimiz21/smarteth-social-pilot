import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bug } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AuthDebugDialog = () => {
  const { user, session, loading, profile } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Debug Auth">
          <Bug className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Authentication Debug Info</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Loading State</h4>
            <Badge variant={loading ? "destructive" : "default"}>
              {loading ? "Loading" : "Loaded"}
            </Badge>
          </div>

          <div>
            <h4 className="font-semibold mb-2">User Object</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              {user ? JSON.stringify(user, null, 2) : "null"}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Session Object</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              {session ? JSON.stringify(session, null, 2) : "null"}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Profile Object</h4>
            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
              {profile ? JSON.stringify(profile, null, 2) : "null"}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Auth Status</h4>
            <div className="space-y-2">
              <div>Authenticated: <Badge variant={user ? "default" : "secondary"}>{user ? "Yes" : "No"}</Badge></div>
              <div>User ID: <code className="bg-muted px-2 py-1 rounded">{user?.id || "None"}</code></div>
              <div>Email: <code className="bg-muted px-2 py-1 rounded">{user?.email || "None"}</code></div>
              <div>Role: <code className="bg-muted px-2 py-1 rounded">{profile?.role || "None"}</code></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};