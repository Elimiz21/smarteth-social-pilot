import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Hash, User, MessageCircle, Heart, Repeat2, Reply, Bot, Zap, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TwitterSearchResult {
  id: string;
  text: string;
  author_name: string;
  author_username: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

interface TwitterAutomation {
  id?: string;
  name: string;
  search_query: string;
  search_type: 'keywords' | 'hashtags' | 'users';
  action_type: 'reply' | 'post';
  ai_prompt: string;
  strategy_context: string;
  content_pillars: string;
  brand_voice: string;
  current_campaigns: string;
  is_active: boolean;
  frequency_minutes: number;
  approved_replies: string[];
  created_at?: string;
}

export function TwitterSearchDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TwitterSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTweet, setSelectedTweet] = useState<TwitterSearchResult | null>(null);
  const [automations, setAutomations] = useState<TwitterAutomation[]>([]);
  const [newAutomation, setNewAutomation] = useState<TwitterAutomation>({
    name: "",
    search_query: "",
    search_type: "keywords",
    action_type: "reply",
    ai_prompt: "",
    strategy_context: "",
    content_pillars: "",
    brand_voice: "",
    current_campaigns: "",
    is_active: true,
    frequency_minutes: 60,
    approved_replies: []
  });
  const [generatingReplies, setGeneratingReplies] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [selectedReplies, setSelectedReplies] = useState<string[]>([]);

  const handleSearch = async (type: 'keywords' | 'hashtags' | 'users') => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - in real implementation, this would call Twitter API
      // For now, we'll show mock data
      const mockResults: TwitterSearchResult[] = [
        {
          id: "1",
          text: type === 'keywords' 
            ? `Great insights about ${searchQuery}! This is exactly what we needed to understand the market trends.`
            : type === 'hashtags'
            ? `Just discovered this amazing ${searchQuery} thread. The community is really growing! 🚀`
            : `@${searchQuery} has been doing incredible work in the crypto space. Really impressed with their analysis.`,
          author_name: "Crypto Analyst",
          author_username: "cryptoanalyst",
          created_at: "2024-01-21T10:30:00Z",
          public_metrics: {
            like_count: 15,
            retweet_count: 3,
            reply_count: 2
          }
        },
        {
          id: "2", 
          text: type === 'keywords'
            ? `The ${searchQuery} market is showing interesting patterns. Here's my take on where we're heading...`
            : type === 'hashtags'
            ? `Another perspective on ${searchQuery} - the technology behind this is fascinating!`
            : `Following @${searchQuery} for their daily insights. Always learning something new!`,
          author_name: "DeFi Explorer",
          author_username: "defiexplorer",
          created_at: "2024-01-21T09:15:00Z",
          public_metrics: {
            like_count: 28,
            retweet_count: 7,
            reply_count: 5
          }
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchResults(mockResults);
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} tweets`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Failed to search tweets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    if (!newAutomation.name || !newAutomation.search_query || !newAutomation.ai_prompt) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedReplies.length === 0) {
      toast({
        title: "Error", 
        description: "Please generate and approve at least one reply template",
        variant: "destructive",
      });
      return;
    }

    try {
      // In real implementation, save to database
      const automation: TwitterAutomation = {
        ...newAutomation,
        approved_replies: selectedReplies,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      
      setAutomations(prev => [...prev, automation]);
      setNewAutomation({
        name: "",
        search_query: "",
        search_type: "keywords",
        action_type: "reply",
        ai_prompt: "",
        strategy_context: "",
        content_pillars: "",
        brand_voice: "",
        current_campaigns: "",
        is_active: true,
        frequency_minutes: 60,
        approved_replies: []
      });
      setSuggestedReplies([]);
      setSelectedReplies([]);

      toast({
        title: "Automation Created",
        description: `Created Twitter automation: ${automation.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create automation",
        variant: "destructive",
      });
    }
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, is_active: !auto.is_active } : auto
      )
    );
  };

  const generateAIReplies = async () => {
    if (!newAutomation.ai_prompt || !newAutomation.search_query) {
      toast({
        title: "Error",
        description: "Please enter an AI prompt and search query first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingReplies(true);
    try {
      const response = await supabase.functions.invoke('generate-ai-replies', {
        body: {
          ai_prompt: newAutomation.ai_prompt,
          search_query: newAutomation.search_query,
          search_type: newAutomation.search_type,
          strategy_context: newAutomation.strategy_context,
          content_pillars: newAutomation.content_pillars,
          brand_voice: newAutomation.brand_voice,
          current_campaigns: newAutomation.current_campaigns,
          action_type: newAutomation.action_type
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setSuggestedReplies(response.data.replies);
      toast({
        title: "AI Replies Generated",
        description: `Generated ${response.data.replies.length} reply suggestions`,
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI replies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReplies(false);
    }
  };

  const toggleReplySelection = (reply: string) => {
    setSelectedReplies(prev => 
      prev.includes(reply) 
        ? prev.filter(r => r !== reply)
        : [...prev, reply]
    );
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(auto => auto.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bot className="w-4 h-4 mr-2" />
          Twitter Automations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Twitter Automation & Search</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search & Test
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Create Automation
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Manage Automations
            </TabsTrigger>
          </TabsList>

          {/* Search & Test Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Query</Label>
                <Input
                  id="search"
                  placeholder="Enter keywords, #hashtags, or @usernames"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs defaultValue="keywords" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="keywords" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Keywords
                  </TabsTrigger>
                  <TabsTrigger value="hashtags" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtags
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Users
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="keywords" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Search for tweets containing specific keywords or phrases
                  </p>
                  <Button 
                    onClick={() => handleSearch('keywords')} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Searching..." : "Search Keywords"}
                  </Button>
                </TabsContent>

                <TabsContent value="hashtags" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Find tweets with specific hashtags (include # in your search)
                  </p>
                  <Button 
                    onClick={() => handleSearch('hashtags')} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Searching..." : "Search Hashtags"}
                  </Button>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Search for tweets from specific users (include @ in your search)
                  </p>
                  <Button 
                    onClick={() => handleSearch('users')} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Searching..." : "Search Users"}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Results Section */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Search Results</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {searchResults.map((tweet) => (
                    <Card key={tweet.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{tweet.author_name}</span>
                              <span className="text-muted-foreground">@{tweet.author_username}</span>
                              <Badge variant="outline" className="text-xs">
                                {formatDate(tweet.created_at)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTweet(tweet)}
                          >
                            <Reply className="w-4 h-4 mr-1" />
                            Test Reply
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm leading-relaxed">{tweet.text}</p>
                        
                        {tweet.public_metrics && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {tweet.public_metrics.reply_count}
                            </div>
                            <div className="flex items-center gap-1">
                              <Repeat2 className="w-3 h-3" />
                              {tweet.public_metrics.retweet_count}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {tweet.public_metrics.like_count}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Test Reply Section */}
            {selectedTweet && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Test Reply to @{selectedTweet.author_username}</h3>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground italic">
                      "{selectedTweet.text}"
                    </p>
                  </CardContent>
                </Card>
                <Button variant="outline" onClick={() => setSelectedTweet(null)} className="w-full">
                  Close Preview
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Create Automation Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create New Twitter Automation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="automation-name">Automation Name</Label>
                  <Input
                    id="automation-name"
                    placeholder="e.g., Crypto News Replies"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-type">Search Type</Label>
                  <Select 
                    value={newAutomation.search_type} 
                    onValueChange={(value: 'keywords' | 'hashtags' | 'users') => 
                      setNewAutomation(prev => ({ ...prev, search_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keywords">Keywords</SelectItem>
                      <SelectItem value="hashtags">Hashtags</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <Input
                  id="search-query"
                  placeholder="e.g., Bitcoin, #crypto, @username"
                  value={newAutomation.search_query}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, search_query: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select 
                    value={newAutomation.action_type} 
                    onValueChange={(value: 'reply' | 'post') => 
                      setNewAutomation(prev => ({ ...prev, action_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reply">Reply to Tweets</SelectItem>
                      <SelectItem value="post">Create New Posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Check Frequency (minutes)</Label>
                  <Select 
                    value={newAutomation.frequency_minutes.toString()} 
                    onValueChange={(value) => 
                      setNewAutomation(prev => ({ ...prev, frequency_minutes: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                      <SelectItem value="120">Every 2 hours</SelectItem>
                      <SelectItem value="240">Every 4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Strategy Context Fields */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Strategy Context (for AI)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="strategy-context">Overall Strategy</Label>
                    <Textarea
                      id="strategy-context"
                      placeholder="Describe your overall social media strategy, goals, and messaging approach..."
                      value={newAutomation.strategy_context}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, strategy_context: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-pillars">Content Pillars</Label>
                    <Textarea
                      id="content-pillars"
                      placeholder="List your key content themes and messaging pillars..."
                      value={newAutomation.content_pillars}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, content_pillars: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-voice">Brand Voice & Tone</Label>
                    <Textarea
                      id="brand-voice"
                      placeholder="Describe your brand voice, tone of voice, and communication style..."
                      value={newAutomation.brand_voice}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, brand_voice: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-campaigns">Current Campaigns</Label>
                    <Textarea
                      id="current-campaigns"
                      placeholder="List current campaigns, promotions, or initiatives to consider..."
                      value={newAutomation.current_campaigns}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, current_campaigns: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* AI Prompt Field */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="ai-prompt">AI Instructions & Context</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder={newAutomation.action_type === 'reply' 
                    ? "Provide specific instructions for AI replies. Example: 'Generate helpful, engaging replies that showcase our expertise in crypto analysis. Keep replies under 280 characters, ask thoughtful questions, and always add value to the conversation.'"
                    : "Provide specific instructions for AI posts. Example: 'Create engaging posts about the latest trends. Include relevant hashtags, keep it informative yet accessible, and encourage engagement.'"
                  }
                  value={newAutomation.ai_prompt}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, ai_prompt: e.target.value }))}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will be used by AI to generate {newAutomation.action_type === 'reply' ? 'replies' : 'posts'} based on your strategy and the trending content found.
                </p>
              </div>

              {/* Generate AI Replies Button */}
              <Button 
                onClick={generateAIReplies} 
                disabled={generatingReplies || !newAutomation.ai_prompt || !newAutomation.search_query}
                className="w-full"
                variant="secondary"
              >
                {generatingReplies ? "Generating AI Replies..." : "Generate AI Reply Suggestions"}
              </Button>

              {/* AI Generated Replies */}
              {suggestedReplies.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">AI Generated Replies - Select to Approve</h4>
                  <div className="space-y-2">
                    {suggestedReplies.map((reply, index) => (
                      <Card 
                        key={index} 
                        className={`cursor-pointer transition-all ${
                          selectedReplies.includes(reply) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-border/80'
                        }`}
                        onClick={() => toggleReplySelection(reply)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <p className="text-sm flex-1">{reply}</p>
                            <div className="ml-2">
                              {selectedReplies.includes(reply) ? (
                                <Badge variant="default">Selected</Badge>
                              ) : (
                                <Badge variant="outline">Click to Select</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedReplies.length} of {suggestedReplies.length} replies
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="automation-active"
                  checked={newAutomation.is_active}
                  onCheckedChange={(checked) => setNewAutomation(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="automation-active">Start automation immediately</Label>
              </div>

              <Button 
                onClick={handleCreateAutomation} 
                className="w-full"
                disabled={selectedReplies.length === 0}
              >
                Create Automation ({selectedReplies.length} replies approved)
              </Button>
            </div>
          </TabsContent>

          {/* Manage Automations Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Active Automations</h3>
              
              {automations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No automations created yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("create")}
                    >
                      Create Your First Automation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {automations.map((automation) => (
                    <Card key={automation.id} className="border-border/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{automation.name}</h4>
                              <Badge variant={automation.is_active ? "default" : "secondary"}>
                                {automation.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {automation.action_type === 'reply' ? 'Reply Bot' : 'Post Bot'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {automation.search_type}: "{automation.search_query}" • Every {automation.frequency_minutes}min
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={automation.is_active}
                              onCheckedChange={() => toggleAutomation(automation.id!)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAutomation(automation.id!)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">AI Prompt:</Label>
                          <p className="text-sm bg-muted p-2 rounded text-muted-foreground">
                            {automation.ai_prompt}
                          </p>
                          <Label className="text-xs font-medium">Approved Replies ({automation.approved_replies.length}):</Label>
                          <div className="space-y-1">
                            {automation.approved_replies.slice(0, 3).map((reply, index) => (
                              <p key={index} className="text-xs bg-muted p-1 rounded text-muted-foreground">
                                {reply}
                              </p>
                            ))}
                            {automation.approved_replies.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{automation.approved_replies.length - 3} more replies...
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}