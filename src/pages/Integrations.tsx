import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe, 
  Twitter, 
  Linkedin, 
  Instagram, 
  MessageCircle,
  Youtube,
  Settings,
  Check,
  X,
  AlertTriangle,
  ShieldX,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { TwitterCredentialsDialog } from "@/components/TwitterCredentialsDialog";
import { TwitterTestButton } from "@/components/TwitterTestButton";
import { CredentialsDialog } from "@/components/CredentialsDialog";

// System-wide platform configurations
const socialPlatformConfigs = [
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: Twitter,
    description: "System-wide Twitter account for all posts",
    secrets: ["TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_TOKEN_SECRET"],
    helpUrl: "https://developer.twitter.com/en/portal/dashboard",
    configured: true // Twitter is already configured
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    description: "System-wide LinkedIn account for professional content",
    secrets: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "LINKEDIN_ACCESS_TOKEN"],
    helpUrl: "https://www.linkedin.com/developers/apps",
    configured: false
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "System-wide Instagram account for visual content",
    secrets: ["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_PAGE_ID"],
    helpUrl: "https://developers.facebook.com/apps/",
    configured: false
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: MessageCircle,
    description: "System-wide Telegram bot for messaging",
    secrets: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
    helpUrl: "https://core.telegram.org/bots#how-do-i-create-a-bot",
    configured: false
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    description: "System-wide YouTube channel for video content",
    secrets: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"],
    helpUrl: "https://console.cloud.google.com/apis/credentials",
    configured: false
  }
];

const aiServiceConfigs = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT models for content generation and AI features",
    secretName: "OPENAI_API_KEY",
    helpUrl: "https://platform.openai.com/api-keys",
    configured: true // Already configured
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Advanced AI reasoning and content creation",
    secretName: "ANTHROPIC_API_KEY", 
    helpUrl: "https://console.anthropic.com/settings/keys",
    configured: false
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Multimodal AI for text and image processing",
    secretName: "GEMINI_API_KEY",
    helpUrl: "https://aistudio.google.com/app/apikey",
    configured: false
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Real-time web search and analysis capabilities",
    secretName: "PERPLEXITY_API_KEY",
    helpUrl: "https://www.perplexity.ai/settings/api",
    configured: false
  }
];

export default function Integrations() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, boolean>>({});
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const testCredentials = async (type: 'platform' | 'service', id: string) => {
    setTesting(prev => ({ ...prev, [id]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('test-credentials', {
        body: type === 'platform' ? { platform: id } : { service: id }
      });

      if (error) {
        console.error(`Error testing ${id} credentials:`, error);
        toast({
          title: "Test Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      const isConfigured = data?.configured === true;
      
      if (type === 'platform') {
        setPlatformStatuses(prev => ({ ...prev, [id]: isConfigured }));
      } else {
        setServiceStatuses(prev => ({ ...prev, [id]: isConfigured }));
      }

      if (data?.error) {
        toast({
          title: "Credentials Invalid",
          description: data.error,
          variant: "destructive",
        });
      }

      return isConfigured;
    } catch (err: any) {
      console.error('Error:', err);
      toast({
        title: "Test Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }));
    }
  };

  // Test all credentials on mount
  useEffect(() => {
    if (user && profile?.role === 'owner') {
      // Test social platforms
      socialPlatformConfigs.forEach(platform => {
        testCredentials('platform', platform.id);
      });
      
      // Test AI services
      aiServiceConfigs.forEach(service => {
        testCredentials('service', service.id);
      });
    }
  }, [user, profile]);

  const refreshCredentials = () => {
    // Test all credentials again
    socialPlatformConfigs.forEach(platform => {
      testCredentials('platform', platform.id);
    });
    
    aiServiceConfigs.forEach(service => {
      testCredentials('service', service.id);
    });
    
    toast({
      title: "Refreshing Status",
      description: "Testing all credentials...",
    });
  };

  const getStatusBadge = (configured: boolean, isLoading: boolean = false) => {
    if (isLoading) {
      return (
        <Badge variant="outline">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />Testing...
        </Badge>
      );
    }
    
    return configured ? (
      <Badge className="bg-success text-success-foreground">
        <Check className="w-3 h-3 mr-1" />Connected
      </Badge>
    ) : (
      <Badge variant="outline">
        <X className="w-3 h-3 mr-1" />Not Configured
      </Badge>
    );
  };

  // Only owners can access integrations
  if (!user || profile?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Access Restricted</h2>
          <p className="text-muted-foreground max-w-md">
            Only account owners can configure system-wide integrations. These settings affect all users in the organization.
          </p>
        </div>
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
            Configure system-wide accounts and API keys for all users
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshCredentials}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="https://supabase.com/dashboard/project/vwylsusacaucxyphbxad/settings/functions" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Secrets
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="social">Social Media Platforms</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialPlatformConfigs.map((platform) => (
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
                    {getStatusBadge(platformStatuses[platform.id] ?? false, testing[platform.id])}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Required Secrets:</p>
                    <div className="flex flex-wrap gap-1">
                      {platform.secrets.map((secret) => (
                        <code key={secret} className="bg-muted px-2 py-1 rounded text-xs">
                          {secret}
                        </code>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <a href={platform.helpUrl} target="_blank" rel="noopener noreferrer">
                        Setup Guide
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => testCredentials('platform', platform.id)}
                      disabled={testing[platform.id]}
                    >
                      {testing[platform.id] ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Test
                    </Button>
                    {platform.id === 'twitter' ? (
                      <>
                        <TwitterCredentialsDialog />
                        <TwitterTestButton />
                      </>
                    ) : platform.id === 'linkedin' ? (
                      <CredentialsDialog
                        platformName="LinkedIn"
                        fields={[
                          { name: "LINKEDIN_CLIENT_ID", label: "Client ID", placeholder: "Enter LinkedIn Client ID" },
                          { name: "LINKEDIN_CLIENT_SECRET", label: "Client Secret", placeholder: "Enter LinkedIn Client Secret", isSecret: true },
                          { name: "LINKEDIN_ACCESS_TOKEN", label: "Access Token", placeholder: "Enter LinkedIn Access Token", isSecret: true }
                        ]}
                      />
                    ) : platform.id === 'instagram' ? (
                      <CredentialsDialog
                        platformName="Instagram"
                        fields={[
                          { name: "INSTAGRAM_ACCESS_TOKEN", label: "Access Token", placeholder: "Enter Instagram Access Token", isSecret: true },
                          { name: "INSTAGRAM_PAGE_ID", label: "Page ID", placeholder: "Enter Instagram Page ID" }
                        ]}
                      />
                    ) : platform.id === 'telegram' ? (
                      <CredentialsDialog
                        platformName="Telegram"
                        fields={[
                          { name: "TELEGRAM_BOT_TOKEN", label: "Bot Token", placeholder: "Enter Telegram Bot Token", isSecret: true },
                          { name: "TELEGRAM_CHAT_ID", label: "Chat ID", placeholder: "Enter Telegram Chat ID" }
                        ]}
                      />
                    ) : platform.id === 'youtube' ? (
                      <CredentialsDialog
                        platformName="YouTube"
                        fields={[
                          { name: "YOUTUBE_CLIENT_ID", label: "Client ID", placeholder: "Enter YouTube Client ID" },
                          { name: "YOUTUBE_CLIENT_SECRET", label: "Client Secret", placeholder: "Enter YouTube Client Secret", isSecret: true },
                          { name: "YOUTUBE_REFRESH_TOKEN", label: "Refresh Token", placeholder: "Enter YouTube Refresh Token", isSecret: true }
                        ]}
                      />
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Edit Credentials
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    {getStatusBadge(serviceStatuses[service.id] ?? false, testing[service.id])}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Required Secret:</p>
                    <code className="bg-muted px-2 py-1 rounded text-xs block w-fit">
                      {service.secretName}
                    </code>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <a href={service.helpUrl} target="_blank" rel="noopener noreferrer">
                        Get API Key
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => testCredentials('service', service.id)}
                      disabled={testing[service.id]}
                    >
                      {testing[service.id] ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Test
                    </Button>
                    <CredentialsDialog
                      platformName={service.name}
                      fields={[
                        { name: service.secretName, label: "API Key", placeholder: `Enter ${service.name} API Key`, isSecret: true }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Instructions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Settings className="w-5 h-5" />
            Configuration Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">To configure a new integration:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>1. Click "Setup Guide" to get your API keys from the provider</li>
              <li>2. Click "Add Secrets" to open Supabase Edge Function Secrets</li>
              <li>3. Add each required secret with the exact name shown</li>
              <li>4. The integration will automatically become available to all users</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">System-wide usage:</h4>
            <p className="text-sm text-muted-foreground">
              All users will post from the same social media accounts and use the same AI service keys. 
              This ensures consistent branding and centralized billing across your organization.
            </p>
          </div>
        </CardContent>
      </Card>

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
            All API keys are stored securely in Supabase Edge Function Secrets and are only accessible 
            to server-side functions. Only account owners can view or modify these integrations.
            Never share API keys in client-side code or with unauthorized users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}