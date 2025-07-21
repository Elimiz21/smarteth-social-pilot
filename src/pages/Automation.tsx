import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Bot, Clock, Play } from "lucide-react";

export default function Automation() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Social Media Automation
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered automation for engagement and lead generation
          </p>
        </div>
        <Button variant="hero">
          <Zap className="w-4 h-4 mr-2" />
          Configure Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Auto-Reply System
            </CardTitle>
            <CardDescription>
              AI-powered responses to mentions and DMs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Engagement Bot
            </CardTitle>
            <CardDescription>
              Automated likes, comments, and thread participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Lead Nurturing
            </CardTitle>
            <CardDescription>
              Automated follow-up sequences for prospects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}