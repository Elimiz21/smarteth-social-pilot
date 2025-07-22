import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
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
  ExternalLink
} from "lucide-react";
import { TwitterCredentialsDialog } from "@/components/TwitterCredentialsDialog";
import { TwitterTestButton } from "@/components/TwitterTestButton";

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

  const getStatusBadge = (configured: boolean) => {
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
                    {getStatusBadge(platform.configured)}
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
                    {platform.id === 'twitter' ? (
                      <>
                        <TwitterCredentialsDialog />
                        <TwitterTestButton />
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" disabled>
                          Edit Credentials
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Test Connection
                        </Button>
                      </>
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
                    {getStatusBadge(service.configured)}
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
                    <Button variant="outline" size="sm" disabled>
                      Edit Credentials
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Test Connection
                    </Button>
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