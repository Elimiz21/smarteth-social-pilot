import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertTriangle
} from "lucide-react";

const socialPlatforms = [
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: Twitter,
    status: "connected",
    description: "Post tweets, threads, and engage with audience",
    fields: ["API Key", "API Secret", "Access Token", "Access Token Secret"]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    status: "disconnected",
    description: "Share professional content and articles",
    fields: ["Client ID", "Client Secret", "Access Token"]
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    status: "disconnected",
    description: "Post photos, stories, and reels",
    fields: ["Access Token", "Page ID"]
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: MessageCircle,
    status: "connected",
    description: "Send messages to channels and groups",
    fields: ["Bot Token", "Chat ID"]
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    status: "disconnected",
    description: "Upload videos and manage channel",
    fields: ["Client ID", "Client Secret", "Refresh Token"]
  }
];

const aiServices = [
  {
    id: "openai",
    name: "OpenAI",
    status: "connected",
    description: "GPT-4, GPT-3.5 for content generation",
    fields: ["API Key"]
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    status: "connected", 
    description: "Advanced reasoning and content creation",
    fields: ["API Key"]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    status: "disconnected",
    description: "Multimodal AI for text and images",
    fields: ["API Key"]
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    status: "disconnected",
    description: "Real-time web search and analysis",
    fields: ["API Key"]
  }
];

export default function Integrations() {
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

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
            {socialPlatforms.map((platform) => (
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
                    {getStatusBadge(platform.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {platform.status === "connected" ? (
                    <div className="space-y-3">
                      {platform.fields.map((field, index) => (
                        <div key={field} className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{field}</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type={showCredentials[`${platform.id}-${index}`] ? "text" : "password"}
                              value={maskCredential("sk-1234567890abcdef", showCredentials[`${platform.id}-${index}`])}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => toggleCredentialVisibility(`${platform.id}-${index}`)}
                            >
                              {showCredentials[`${platform.id}-${index}`] ? 
                                <EyeOff className="w-3 h-3" /> : 
                                <Eye className="w-3 h-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={true} />
                          <Label className="text-sm">Auto-posting enabled</Label>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {platform.fields.map((field) => (
                        <div key={field} className="space-y-2">
                          <Label className="text-sm">{field}</Label>
                          <Input placeholder={`Enter your ${field.toLowerCase()}`} />
                        </div>
                      ))}
                      <Button variant="hero" className="w-full">
                        <Key className="w-4 h-4 mr-2" />
                        Connect {platform.name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiServices.map((service) => (
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
                    {getStatusBadge(service.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.status === "connected" ? (
                    <div className="space-y-3">
                      {service.fields.map((field, index) => (
                        <div key={field} className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{field}</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type={showCredentials[`${service.id}-${index}`] ? "text" : "password"}
                              value={maskCredential("sk-abcd1234567890ef", showCredentials[`${service.id}-${index}`])}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => toggleCredentialVisibility(`${service.id}-${index}`)}
                            >
                              {showCredentials[`${service.id}-${index}`] ? 
                                <EyeOff className="w-3 h-3" /> : 
                                <Eye className="w-3 h-3" />
                              }
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={true} />
                          <Label className="text-sm">Active for content generation</Label>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {service.fields.map((field) => (
                        <div key={field} className="space-y-2">
                          <Label className="text-sm">{field}</Label>
                          <Input placeholder={`Enter your ${field.toLowerCase()}`} type="password" />
                        </div>
                      ))}
                      <Button variant="hero" className="w-full">
                        <Key className="w-4 h-4 mr-2" />
                        Connect {service.name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
            All credentials are encrypted and stored securely. Only the account owner can view and modify integration settings. 
            Credentials are masked showing only the last 4 characters for security purposes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}