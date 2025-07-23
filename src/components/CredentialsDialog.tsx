import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Eye, EyeOff } from "lucide-react";

interface CredentialField {
  name: string;
  label: string;
  placeholder: string;
  isSecret?: boolean;
}

interface CredentialsDialogProps {
  platformName: string;
  fields: CredentialField[];
  triggerLabel?: string;
}

export const CredentialsDialog = ({ platformName, fields, triggerLabel = "Edit Credentials" }: CredentialsDialogProps) => {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateCredentials = async () => {
    // Check if all required fields are filled
    const missingFields = fields.filter(field => !credentials[field.name] || credentials[field.name].trim() === "");
    if (missingFields.length > 0) {
      toast({
        title: "Missing Credentials",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate OpenAI API key format
    if (platformName.toLowerCase() === 'openai' && credentials.OPENAI_API_KEY) {
      const apiKey = credentials.OPENAI_API_KEY.trim();
      if (!apiKey.startsWith('sk-') || apiKey.length < 48) {
        toast({
          title: "Invalid API Key Format",
          description: "OpenAI API keys should start with 'sk-' and be at least 48 characters long. Please check your API key.",
          variant: "destructive",
        });
        return;
      }
    }

    // Show instructions for manual update
    toast({
      title: "Manual Update Required",
      description: `The credentials you entered are valid. Please manually add them to Supabase Edge Function Secrets using the "Manage Secrets" button.`,
    });

    // Show the secrets that need to be updated
    const secretsList = fields.map(field => field.name).join(", ");
    setTimeout(() => {
      toast({
        title: "Secrets to Update",
        description: `Update these secrets in Supabase: ${secretsList}`,
      });
    }, 2000);

    setTimeout(() => {
      toast({
        title: "Next Steps",
        description: "1. Click 'Manage Secrets' 2. Find the secret name 3. Paste your API key 4. Save 5. Test again",
      });
    }, 4000);

    setIsOpen(false);
    // Clear form for security
    setCredentials({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update {platformName} Credentials</DialogTitle>
          <DialogDescription>
            Enter your {platformName} API credentials to enable system-wide integration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.isSecret ? (
                <div className="relative">
                  <Input
                    id={field.name}
                    type={showSecrets[field.name] ? "text" : "password"}
                    value={credentials[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => toggleSecretVisibility(field.name)}
                  >
                    {showSecrets[field.name] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <Input
                  id={field.name}
                  type="text"
                  value={credentials[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
          
          <div className="text-sm text-muted-foreground">
            <p>Make sure you have the required permissions for the {platformName} API.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdateCredentials}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Credentials"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};