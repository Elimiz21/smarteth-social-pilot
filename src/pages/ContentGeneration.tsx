import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLibrary, type GeneratedContent } from "@/components/content/ContentLibrary";
import { WeeklyContentPlanner, type WeeklyContentPlan } from "@/components/content/WeeklyContentPlanner";
import { AISettingsDialog } from "@/components/content/AISettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Edit, 
  Save, 
  Wand2,
  MessageSquare,
  Image,
  BarChart3,
  Settings,
  Calendar,
  Library,
  Brain
} from "lucide-react";

const aiProviders = [
  { id: "openai", name: "OpenAI GPT-4", recommended: true },
  { id: "claude", name: "Anthropic Claude", recommended: true },
  { id: "gemini", name: "Google Gemini" },
  { id: "meta", name: "Meta AI" },
  { id: "perplexity", name: "Perplexity AI" }
];

const contentTypes = [
  { id: "tweet", name: "X/Twitter Post", platforms: ["Twitter"] },
  { id: "linkedin", name: "LinkedIn Article", platforms: ["LinkedIn"] },
  { id: "instagram", name: "Instagram Post", platforms: ["Instagram"] },
  { id: "thread", name: "Twitter Thread", platforms: ["Twitter"] },
  { id: "announcement", name: "Multi-Platform Announcement", platforms: ["All"] }
];

export default function ContentGeneration() {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<any>(null);
  const [contentPrompt, setContentPrompt] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("tweet");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [keywords, setKeywords] = useState("");
  const [specificRequirements, setSpecificRequirements] = useState("");
  const [complianceGuidelines, setComplianceGuidelines] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVersions, setGeneratedVersions] = useState<any[]>([]);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([
    {
      id: "1",
      content: "🚀 SmartEth's regulated approach to ETH asset management continues to deliver exceptional results for institutional clients. Our cutting-edge DeFi integration provides the security and transparency modern investors demand. #SmartETH #InstitutionalCrypto #DeFi",
      type: "tweet",
      audience: "investors",
      tone: "professional",
      platforms: ["twitter", "linkedin"],
      keywords: ["SmartETH", "DeFi", "institutional"],
      engagementScore: 8.5,
      createdAt: new Date(Date.now() - 86400000),
      status: "approved",
    },
    {
      id: "2", 
      content: "The future of crypto asset management lies in regulation and innovation working together. SmartEth's Israeli regulatory framework provides the foundation for sustainable growth in the digital asset space.",
      type: "linkedin",
      audience: "investors",
      tone: "authoritative", 
      platforms: ["linkedin"],
      keywords: ["regulation", "innovation", "digital assets"],
      engagementScore: 9.2,
      createdAt: new Date(Date.now() - 172800000),
      status: "approved",
    },
  ]);

  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyContentPlan[]>([]);

  useEffect(() => {
    const fetchStrategies = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setStrategies(data);
        const active = data.find(s => s.is_active) || data[0];
        setActiveStrategy(active);
        setContentPrompt(buildStrategyPrompt(active));
        if (active?.target_audience) {
          setSelectedAudience(active.target_audience.split(',')[0]?.trim().toLowerCase() || "");
        }
      }
    };

    fetchStrategies();
  }, [user?.id]);

  const buildStrategyPrompt = (strategy = activeStrategy) => {
    if (!strategy) return "";
    
    return `
Context: You are creating content for ${strategy.name || 'our marketing strategy'}.

Strategy Overview:
Strategy Overview:
${strategy.description || ''}

Target Audience: ${strategy.target_audience || ''}

Key Messaging: ${strategy.key_messaging || ''}

Content Themes: ${strategy.content_themes || ''}

Objectives: ${strategy.objectives?.map((obj: any) => `- ${obj.text}`).join('\n') || ''}

Please create content that aligns with this strategy and resonates with our target audience.
    `.trim();
  };

  const handleCreatePlan = (plan: Omit<WeeklyContentPlan, 'id'>) => {
    const newPlan = { ...plan, id: Date.now().toString() };
    setWeeklyPlans(prev => [...prev, newPlan]);
  };

  const handleExecutePlan = (planId: string) => {
    // This would open the bulk scheduler - not used directly anymore
    console.log("Executing plan:", planId);
  };

  const handleScheduleBulkItems = (items: any[]) => {
    console.log("Scheduling bulk items:", items);
    // Here you would integrate with the scheduling system
    // For now, we'll add the generated content to the library
    const newContents = items.map(item => ({
      ...item.content,
      status: "approved" as const
    }));
    setGeneratedContents(prev => [...prev, ...newContents]);
  };

  const handleEditPlan = (plan: WeeklyContentPlan) => {
    console.log("Edit plan:", plan);
  };

  const handleSelectContent = (content: GeneratedContent) => {
    console.log("Selected content:", content);
  };

  const handleEditContent = (content: GeneratedContent) => {
    console.log("Edit content:", content);
  };

  const handleDeleteContent = (id: string) => {
    setGeneratedContents(prev => prev.filter(c => c.id !== id));
  };

  const handleApproveContent = (id: string) => {
    setGeneratedContents(prev => 
      prev.map(c => c.id === id ? { ...c, status: "approved" as const } : c)
    );
  };

  const handleApproveGenerated = (index: number) => {
    const version = generatedVersions[index];
    if (!version) return;

    const newContent: GeneratedContent = {
      id: Date.now().toString() + index,
      content: version.content,
      type: selectedContentType as any,
      audience: selectedAudience,
      tone: selectedTone,
      platforms: contentTypes.find(t => t.id === selectedContentType)?.platforms || [],
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      engagementScore: version.engagementScore || 8.5,
      createdAt: new Date(),
      status: "approved"
    };

    setGeneratedContents(prev => [...prev, newContent]);
    
    // Remove from generated versions after approval
    setGeneratedVersions(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
        body: {
          contentPrompt,
          contentType: selectedContentType,
          targetAudience: selectedAudience,
          tone: selectedTone,
          keywords,
          specificRequirements,
          complianceGuidelines,
          callToAction
        }
      });

      if (error) throw error;

      setGeneratedVersions(data.generatedContent || []);
    } catch (error) {
      console.error('Error generating content:', error);
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
      alert(`Error generating content: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Content Generation
          </h1>
          <p className="text-muted-foreground mt-2">
            Create engaging content for SmartEth marketing campaigns
          </p>
        </div>
        <div className="flex gap-3">
          <AISettingsDialog>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              AI Settings
            </Button>
          </AISettingsDialog>
          <Button variant="hero">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Content
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Generator
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            Content Library
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Weekly Planner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Content Settings
            </CardTitle>
            <CardDescription>
              Configure your content generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Provider */}
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select defaultValue="openai">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        {provider.name}
                        {provider.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeStrategy?.target_audience ? (
                    activeStrategy.target_audience.split(',').map((audience: string, index: number) => (
                      <SelectItem key={index} value={audience.trim().toLowerCase()}>
                        {audience.trim()}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="investors">Institutional Investors</SelectItem>
                      <SelectItem value="retail">Retail Crypto Holders</SelectItem>
                      <SelectItem value="traders">Professional Traders</SelectItem>
                      <SelectItem value="general">General Public</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label>Tone & Style</Label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Topic/Keywords */}
            <div className="space-y-2">
              <Label>Keywords/Topics</Label>
              <Input 
                placeholder="SmartEth, DeFi, Asset Management..." 
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Generation Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Content Prompt Builder
            </CardTitle>
            <CardDescription>
              Craft detailed prompts for AI content generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="prompt" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prompt">Prompt Builder</TabsTrigger>
                <TabsTrigger value="generated">Generated Content</TabsTrigger>
                <TabsTrigger value="visual">Visual Content</TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Content Role/Context</Label>
                      <Textarea 
                        placeholder="You are an expert crypto marketing strategist for SmartEth, a regulated Israeli asset management firm raising $50M for innovative ETH strategies..."
                        value={contentPrompt}
                        onChange={(e) => setContentPrompt(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                  <div className="space-y-2">
                    <Label>Specific Requirements</Label>
                    <Textarea 
                      placeholder="Create content that emphasizes regulatory compliance, institutional credibility, innovative technology, proven track record..."
                      value={specificRequirements}
                      onChange={(e) => setSpecificRequirements(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Compliance Guidelines</Label>
                    <Textarea 
                      placeholder="Include required disclaimers, avoid promotional language, focus on factual information, emphasize risk disclosures..."
                      value={complianceGuidelines}
                      onChange={(e) => setComplianceGuidelines(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Call-to-Action</Label>
                    <Input 
                      placeholder="Learn more at smarteth.com | Contact for institutional inquiries" 
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="hero" 
                    className="flex-1" 
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate 3 Versions"}
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="generated" className="space-y-4">
                <div className="space-y-4">
                  {generatedVersions.length > 0 ? (
                    generatedVersions.map((version, index) => (
                      <Card key={index} className="border border-accent/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Version {index + 1}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Engagement: {version.engagementScore || 8.5}/10
                              </Badge>
                              <Button variant="ghost" size="icon-sm">
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon-sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {version.content}
                          </p>
                          {version.suggestedHashtags && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {version.suggestedHashtags.map((tag: string, tagIndex: number) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-4 pt-3 border-t">
                            <div className="text-xs text-muted-foreground">
                              Character count: {version.characterCount || version.content?.length || 0} | Estimated reach: 2.5K
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleApproveGenerated(index)}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Generate content to see results here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="visual" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Visual Content Prompt</Label>
                    <Textarea 
                      placeholder="Create a professional financial chart showing ETH performance, modern corporate design, SmartEth branding..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Image Style</Label>
                      <Select defaultValue="professional">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="modern">Modern Tech</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="infographic">Infographic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dimensions</Label>
                      <Select defaultValue="square">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square (1:1)</SelectItem>
                          <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                          <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                          <SelectItem value="twitter">Twitter Card (2:1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="accent" className="w-full">
                    <Image className="w-4 h-4 mr-2" />
                    Generate Visual Content
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <ContentLibrary 
            contents={generatedContents}
            onSelectContent={handleSelectContent}
            onEditContent={handleEditContent}
            onDeleteContent={handleDeleteContent}
            onApproveContent={handleApproveContent}
          />
        </TabsContent>

        <TabsContent value="planner">
          <WeeklyContentPlanner 
            plans={weeklyPlans}
            onCreatePlan={handleCreatePlan}
            onExecutePlan={handleExecutePlan}
            onEditPlan={handleEditPlan}
            onScheduleBulkItems={handleScheduleBulkItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}