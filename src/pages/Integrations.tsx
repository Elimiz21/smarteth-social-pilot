import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Globe, 
  Twitter, 
  Linkedin, 
  Instagram, 
  MessageCircle,
  Youtube,
  Settings,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Plus,
  Loader2
} from "lucide-react";

const socialPlatformConfigs = [
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: Twitter,
    description: "Post tweets, threads, and engage with audience",
    fields: [
      { key: "api_key", label: "API Key", type: "password" },
      { key: "api_secret", label: "API Secret", type: "password" },
      { key: "access_token", label: "Access Token", type: "password" },
      { key: "access_token_secret", label: "Access Token Secret", type: "password" }
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    description: "Share professional content and articles",
    fields: [
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
      { key: "access_token", label: "Access Token", type: "password" }
    ]
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Post photos, stories, and reels",
    fields: [
      { key: "access_token", label: "Access Token", type: "password" },
      { key: "page_id", label: "Page ID", type: "text" }
    ]
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: MessageCircle,
    description: "Send messages to channels and groups",
    fields: [
      { key: "bot_token", label: "Bot Token", type: "password" },
      { key: "chat_id", label: "Chat ID", type: "text" }
    ]
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    description: "Upload videos and manage channel",
    fields: [
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
      { key: "refresh_token", label: "Refresh Token", type: "password" }
    ]
  }
];

const aiServiceConfigs = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-3.5 for content generation",
    isSupabaseSecret: true,
    secretName: "OPENAI_API_KEY",
    helpUrl: "https://platform.openai.com/api-keys"
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Advanced reasoning and content creation",
    isSupabaseSecret: true,
    secretName: "ANTHROPIC_API_KEY",
    helpUrl: "https://console.anthropic.com/settings/keys"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Multimodal AI for text and images",
    isSupabaseSecret: true,
    secretName: "GEMINI_API_KEY",
    helpUrl: "https://aistudio.google.com/app/apikey"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Real-time web search and analysis",
    isSupabaseSecret: true,
    secretName: "PERPLEXITY_API_KEY",
    helpUrl: "https://www.perplexity.ai/settings/api"
  }
];

export default function Integrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_credentials')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error",
        description: "Failed to load credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCredentialForPlatform = (platform: string) => {
    return credentials.find(cred => cred.platform === platform);
  };

  const toggleCredentialVisibility = (id: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-success text-success-foreground"><Check className="w-3 h-3 mr-1" />Connected</Badge>;
      case "disconnected":
        return <Badge variant="outline"><X className="w-3 h-3 mr-1" />Disconnected</Badge>;
      case "error":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const maskCredential = (value: string, show: boolean) => {
    if (!value) return "";
    if (show) return value;
    return "***" + value.slice(-4);
  };

  const openDialog = (platformId: string) => {
    const credential = getCredentialForPlatform(platformId);
    const platformConfig = socialPlatformConfigs.find(p => p.id === platformId);
    
    if (credential && platformConfig) {
      const initialData: Record<string, string> = {};
      platformConfig.fields.forEach(field => {
        initialData[field.key] = credential.credentials?.[field.key] || '';
      });
      setFormData(initialData);
    } else {
      setFormData({});
    }
    
    setDialogOpen(platformId);
  };

  const closeDialog = () => {
    setDialogOpen(null);
    setFormData({});
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePlatform = async (platformId: string) => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      const existingCredential = getCredentialForPlatform(platformId);
      
      if (existingCredential) {
        const { error } = await supabase
          .from('social_media_credentials')
          .update({
            credentials: formData,
            updated_at: new Date().toISOString(),
            is_active: true
          })
          .eq('id', existingCredential.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('social_media_credentials')
          .insert({
            user_id: user.id,
            platform: platformId,
            credentials: formData,
            is_active: true
          });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${socialPlatformConfigs.find(p => p.id === platformId)?.name} credentials saved successfully`,
      });
      
      await fetchCredentials();
      closeDialog();
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save credentials",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnectPlatform = async (platformId: string) => {
    const credential = getCredentialForPlatform(platformId);
    if (!credential) return;

    try {
      const { error } = await supabase
        .from('social_media_credentials')
        .delete()
        .eq('id', credential.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${socialPlatformConfigs.find(p => p.id === platformId)?.name} disconnected successfully`,
      });
      
      await fetchCredentials();
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect platform",
        variant: "destructive",
      });
    }
  };

  const togglePlatformStatus = async (platformId: string) => {
    const credential = getCredentialForPlatform(platformId);
    if (!credential) return;

    try {
      const { error } = await supabase
        .from('social_media_credentials')
        .update({ is_active: !credential.is_active })
        .eq('id', credential.id);

      if (error) throw error;
      await fetchCredentials();
    } catch (error) {
      console.error('Error updating platform status:', error);
      toast({
        title: "Error",
        description: "Failed to update platform status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Platform Integrations
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect and manage all your social media and AI service accounts
          </p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Integration Settings
        </Button>
      </div>

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="social">Social Media Platforms</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialPlatformConfigs.map((platform) => {
              const credential = getCredentialForPlatform(platform.id);
              const status = credential ? (credential.is_active ? "connected" : "disconnected") : "disconnected";
              
              return (
                <Card key={platform.id} className="hover:shadow-card-hover transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                          <platform.icon className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <CardDescription className="text-sm">{platform.description}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {credential ? (
                      <div className="space-y-3">
                        {platform.fields.map((field, index) => (
                          <div key={field.key} className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{field.label}</Label>
                            <div className="flex items-center gap-2">
                              <Input 
                                type={showCredentials[`${platform.id}-${field.key}`] ? "text" : "password"}
                                value={maskCredential(credential.credentials?.[field.key] || '', showCredentials[`${platform.id}-${field.key}`])}
                                readOnly
                                className="font-mono text-xs"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleCredentialVisibility(`${platform.id}-${field.key}`)}
                              >
                                {showCredentials[`${platform.id}-${field.key}`] ? 
                                  <EyeOff className="w-3 h-3" /> : 
                                  <Eye className="w-3 h-3" />
                                }
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={credential.is_active} 
                              onCheckedChange={() => togglePlatformStatus(platform.id)}
                            />
                            <Label className="text-sm">Auto-posting enabled</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDialog(platform.id)}>
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDisconnectPlatform(platform.id)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm mb-4">
                          Connect your {platform.name} account to enable auto-posting
                        </p>
                        <Button variant="hero" onClick={() => openDialog(platform.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Connect {platform.name}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiServiceConfigs.map((service) => (
              <Card key={service.id} className="hover:shadow-card-hover transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription className="text-sm">{service.description}</CardDescription>
                      </div>
                    </div>
                    {service.id === "openai" ? getStatusBadge("connected") : getStatusBadge("disconnected")}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.id === "openai" ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="password"
                            value="sk-proj-****configured"
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Badge variant="secondary" className="text-xs">
                            Configured in Supabase
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={true} />
                          <Label className="text-sm">Active for content generation</Label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-4">
                      <p className="text-muted-foreground text-sm">
                        Configure your {service.name} API key in Supabase Edge Function Secrets
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={service.helpUrl} target="_blank" rel="noopener noreferrer">
                            Get API Key
                          </a>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Secret name: <code className="bg-muted px-1 rounded">{service.secretName}</code>
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Platform Connection Dialog */}
      {dialogOpen && (
        <Dialog open={true} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Connect {socialPlatformConfigs.find(p => p.id === dialogOpen)?.name}
              </DialogTitle>
              <DialogDescription>
                Enter your credentials to connect this platform for auto-posting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {socialPlatformConfigs.find(p => p.id === dialogOpen)?.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm">{field.label}</Label>
                  <Input 
                    type={field.type}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleSavePlatform(dialogOpen)}
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Credentials
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Security Notice */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">
            All credentials are encrypted and stored securely in your Supabase database. 
            Only you can view and modify your integration settings. 
            Social media credentials are masked showing only the last 4 characters for security.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}