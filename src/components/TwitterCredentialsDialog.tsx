import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Eye, EyeOff } from "lucide-react";

interface TwitterCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export const TwitterCredentialsDialog = () => {
  const [credentials, setCredentials] = useState<TwitterCredentials>({
    consumerKey: "",
    consumerSecret: "",
    accessToken: "",
    accessTokenSecret: ""
  });
  const [showSecrets, setShowSecrets] = useState({
    consumerSecret: false,
    accessTokenSecret: false
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof TwitterCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const toggleSecretVisibility = (field: 'consumerSecret' | 'accessTokenSecret') => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateCredentials = async () => {
    if (!credentials.consumerKey || !credentials.consumerSecret || !credentials.accessToken || !credentials.accessTokenSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-twitter-secrets', {
        body: {
          TWITTER_CONSUMER_KEY: credentials.consumerKey,
          TWITTER_CONSUMER_SECRET: credentials.consumerSecret,
          TWITTER_ACCESS_TOKEN: credentials.accessToken,
          TWITTER_ACCESS_TOKEN_SECRET: credentials.accessTokenSecret
        }
      });

      if (error) {
        console.error('Error updating Twitter credentials:', error);
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.success) {
        toast({
          title: "Credentials Updated!",
          description: "Twitter credentials have been successfully updated",
        });
        setIsOpen(false);
        setCredentials({
          consumerKey: "",
          consumerSecret: "",
          accessToken: "",
          accessTokenSecret: ""
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Error:', err);
      toast({
        title: "Update Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Update Twitter Credentials
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Twitter API Credentials</DialogTitle>
          <DialogDescription>
            Enter your Twitter API credentials. You can get these from your Twitter Developer Portal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consumerKey">Consumer Key (API Key)</Label>
            <Input
              id="consumerKey"
              type="text"
              value={credentials.consumerKey}
              onChange={(e) => handleInputChange('consumerKey', e.target.value)}
              placeholder="Enter your Twitter Consumer Key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerSecret">Consumer Secret (API Secret)</Label>
            <div className="relative">
              <Input
                id="consumerSecret"
                type={showSecrets.consumerSecret ? "text" : "password"}
                value={credentials.consumerSecret}
                onChange={(e) => handleInputChange('consumerSecret', e.target.value)}
                placeholder="Enter your Twitter Consumer Secret"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => toggleSecretVisibility('consumerSecret')}
              >
                {showSecrets.consumerSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="text"
              value={credentials.accessToken}
              onChange={(e) => handleInputChange('accessToken', e.target.value)}
              placeholder="Enter your Twitter Access Token"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessTokenSecret">Access Token Secret</Label>
            <div className="relative">
              <Input
                id="accessTokenSecret"
                type={showSecrets.accessTokenSecret ? "text" : "password"}
                value={credentials.accessTokenSecret}
                onChange={(e) => handleInputChange('accessTokenSecret', e.target.value)}
                placeholder="Enter your Twitter Access Token Secret"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => toggleSecretVisibility('accessTokenSecret')}
              >
                {showSecrets.accessTokenSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Make sure your Twitter app has "Read and Write" permissions enabled.</p>
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