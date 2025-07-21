import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  Edit,
  Trash2,
  Play,
  MessageSquare,
  Target,
  Settings
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import type { GeneratedContent } from "../content/ContentLibrary";
import type { WeeklyContentPlan } from "../content/WeeklyContentPlanner";

interface BulkScheduleItem {
  id: string;
  content: GeneratedContent;
  recommendedDate: Date;
  recommendedTime: string;
  recommendedPlatforms: string[];
  reasoning: string;
  selected: boolean;
}

interface BulkSchedulerProps {
  weeklyPlan: WeeklyContentPlan;
  onScheduleItems: (items: BulkScheduleItem[]) => void;
  onCancel: () => void;
}

export function BulkScheduler({ weeklyPlan, onScheduleItems, onCancel }: BulkSchedulerProps) {
  const [generatedItems, setGeneratedItems] = useState<BulkScheduleItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // Mock AI content generation and scheduling recommendations
  const generateWeeklyContent = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockContent: GeneratedContent[] = [
      {
        id: "gen-1",
        content: `🔥 Week ahead preview: SmartEth continues to innovate in the ETH asset management space. Our regulated approach ensures institutional-grade security while maximizing DeFi opportunities. ${weeklyPlan.hashtags.map(h => `#${h}`).join(' ')}`,
        type: "tweet",
        audience: weeklyPlan.targetAudience,
        tone: "professional",
        platforms: ["twitter", "linkedin"],
        keywords: weeklyPlan.contentThemes,
        engagementScore: 8.7,
        createdAt: new Date(),
        status: "draft",
      },
      {
        id: "gen-2", 
        content: `Market insights from SmartEth: The regulatory landscape in crypto asset management is evolving rapidly. Our Israeli regulatory framework positions us at the forefront of compliant DeFi innovation. Key trends to watch this week...`,
        type: "linkedin",
        audience: weeklyPlan.targetAudience,
        tone: "authoritative",
        platforms: ["linkedin"],
        keywords: weeklyPlan.contentThemes,
        engagementScore: 9.1,
        createdAt: new Date(),
        status: "draft",
      },
      {
        id: "gen-3",
        content: `💡 Pro tip Tuesday: Understanding the difference between traditional ETH holdings and professionally managed ETH strategies. SmartEth's regulated approach offers enhanced security and optimized returns. ${weeklyPlan.hashtags.slice(0,3).map(h => `#${h}`).join(' ')}`,
        type: "tweet",
        audience: weeklyPlan.targetAudience,
        tone: "educational",
        platforms: ["twitter", "instagram"],
        keywords: weeklyPlan.contentThemes,
        engagementScore: 8.3,
        createdAt: new Date(),
        status: "draft",
      },
      {
        id: "gen-4",
        content: `Week in review: SmartEth's innovative approach to ETH asset management continues to deliver results. Our regulated framework ensures transparency while our DeFi integration maximizes opportunities. Thank you to our institutional partners for their continued trust.`,
        type: "linkedin",
        audience: weeklyPlan.targetAudience,
        tone: "professional",
        platforms: ["linkedin", "facebook"],
        keywords: weeklyPlan.contentThemes,
        engagementScore: 8.9,
        createdAt: new Date(),
        status: "draft",
      },
      {
        id: "gen-5",
        content: `🎯 Focus Friday: The future of institutional crypto lies in regulation + innovation. SmartEth's Israeli regulatory advantage provides the foundation for sustainable growth in digital asset management. ${weeklyPlan.hashtags.slice(0,2).map(h => `#${h}`).join(' ')}`,
        type: "tweet",
        audience: weeklyPlan.targetAudience,
        tone: "inspirational",
        platforms: ["twitter"],
        keywords: weeklyPlan.contentThemes,
        engagementScore: 8.6,
        createdAt: new Date(),
        status: "draft",
      },
    ];

    // Generate AI recommendations for optimal scheduling
    const weekStart = startOfWeek(weeklyPlan.startDate, { weekStartsOn: 1 });
    const schedulingItems: BulkScheduleItem[] = mockContent.map((content, index) => {
      // AI logic for optimal timing
      const dayOffset = index < 3 ? index * 2 : (index - 3) * 2 + 1; // Spread across week
      const recommendedDate = addDays(weekStart, dayOffset);
      
      // AI logic for optimal time based on content type and audience
      const getOptimalTime = (type: string, audience: string) => {
        if (audience === "investors") {
          return type === "linkedin" ? "09:00" : "15:00"; // Business hours for investors
        }
        return type === "instagram" ? "18:00" : "12:00"; // Peak engagement times
      };

      // AI reasoning for recommendations
      const reasoning = `Optimal timing based on ${weeklyPlan.targetAudience} engagement patterns. ${content.type === "linkedin" ? "Business hours maximize professional reach." : "Peak social media activity window."} Platform-specific timing for maximum visibility.`;

      return {
        id: `schedule-${content.id}`,
        content,
        recommendedDate,
        recommendedTime: getOptimalTime(content.type, weeklyPlan.targetAudience),
        recommendedPlatforms: content.platforms,
        reasoning,
        selected: true, // All selected by default for review
      };
    });

    setGeneratedItems(schedulingItems);
    setReviewMode(true);
    setIsGenerating(false);
  };

  const toggleItemSelection = (itemId: string) => {
    setGeneratedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleScheduleSelected = () => {
    const selectedItems = generatedItems.filter(item => item.selected);
    onScheduleItems(selectedItems);
  };

  const selectedCount = generatedItems.filter(item => item.selected).length;

  if (!reviewMode) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI Content Generation & Scheduling</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Generate a full week of optimized content based on your "{weeklyPlan.name}" plan with AI-powered scheduling recommendations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="p-3 bg-card border rounded-lg">
              <div className="font-medium">Content Goals</div>
              <div className="text-muted-foreground">{weeklyPlan.goals.length} objectives</div>
            </div>
            <div className="p-3 bg-card border rounded-lg">
              <div className="font-medium">Target Audience</div>
              <div className="text-muted-foreground">{weeklyPlan.targetAudience}</div>
            </div>
            <div className="p-3 bg-card border rounded-lg">
              <div className="font-medium">Content Themes</div>
              <div className="text-muted-foreground">{weeklyPlan.contentThemes.length} themes</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              variant="hero" 
              onClick={generateWeeklyContent}
              disabled={isGenerating}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Weekly Content
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Review Generated Content</h3>
          <p className="text-muted-foreground">
            AI has generated {generatedItems.length} posts for "{weeklyPlan.name}" with optimized scheduling recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedCount} selected</Badge>
        </div>
      </div>

      {/* Generated Content Review */}
      <div className="space-y-4">
        {generatedItems.map((item) => (
          <Card key={item.id} className={`transition-all ${item.selected ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{item.content.type}</Badge>
                      <Badge variant="secondary">Score: {item.content.engagementScore}/10</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scheduled for {format(item.recommendedDate, 'EEEE, MMM d')} at {item.recommendedTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{item.content.content}</p>
              
              <div className="flex flex-wrap gap-1">
                {item.recommendedPlatforms.map((platform) => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs font-medium text-muted-foreground mb-1">AI Recommendation</div>
                <p className="text-xs text-muted-foreground">{item.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          onClick={handleScheduleSelected}
          disabled={selectedCount === 0}
          className="flex-1"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule {selectedCount} Posts
        </Button>
        <Button variant="outline" onClick={() => setReviewMode(false)}>
          <Sparkles className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Export the BulkScheduleItem type for use in other components
export type { BulkScheduleItem };