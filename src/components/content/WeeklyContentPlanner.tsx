import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BulkScheduler, type BulkScheduleItem } from "../scheduling/BulkScheduler";
import { 
  Calendar,
  Clock,
  Target,
  Sparkles,
  Save,
  Play,
  Settings,
  Plus,
  TrendingUp,
  Users,
  Hash
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

export interface WeeklyContentPlan {
  id: string;
  name: string;
  startDate: Date;
  goals: string[];
  targetAudience: string;
  contentThemes: string[];
  postingSchedule: {
    [key: string]: { // day of week
      platforms: string[];
      timeSlots: string[];
      contentTypes: string[];
    };
  };
  keyMessages: string[];
  hashtags: string[];
  status: "draft" | "active" | "completed";
}

interface WeeklyContentPlannerProps {
  plans: WeeklyContentPlan[];
  onCreatePlan: (plan: Omit<WeeklyContentPlan, 'id'>) => void;
  onExecutePlan: (planId: string) => void;
  onEditPlan: (plan: WeeklyContentPlan) => void;
  onScheduleBulkItems?: (items: BulkScheduleItem[]) => void;
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const platforms = [
  { id: "twitter", name: "Twitter/X" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
];

const contentTypes = [
  { id: "educational", name: "Educational Content" },
  { id: "promotional", name: "Promotional Posts" },
  { id: "thought-leadership", name: "Thought Leadership" },
  { id: "company-updates", name: "Company Updates" },
  { id: "market-insights", name: "Market Insights" },
  { id: "user-stories", name: "User Stories" },
];

const timeSlots = [
  "09:00", "12:00", "15:00", "18:00", "21:00"
];

export function WeeklyContentPlanner({ plans, onCreatePlan, onExecutePlan, onEditPlan, onScheduleBulkItems }: WeeklyContentPlannerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkScheduler, setShowBulkScheduler] = useState(false);
  const [selectedPlanForExecution, setSelectedPlanForExecution] = useState<WeeklyContentPlan | null>(null);

  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const activePlan = plans.find(plan => plan.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Weekly Content Planning</h2>
          <p className="text-muted-foreground">Plan and automate your content strategy</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Create Weekly Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreatePlanDialog 
              onCreatePlan={(plan) => {
                onCreatePlan(plan);
                setShowCreateDialog(false);
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Plan Card */}
      {activePlan && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {activePlan.name}
                  <Badge variant="default">Active</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Week of {format(activePlan.startDate, 'MMM d, yyyy')}
                </p>
              </div>
              <Button 
                variant="hero"
                onClick={() => {
                  setSelectedPlanForExecution(activePlan);
                  setShowBulkScheduler(true);
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate & Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Goals
                </h4>
                <div className="space-y-1">
                  {activePlan.goals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Audience
                </h4>
                <Badge variant="outline">{activePlan.targetAudience}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Themes
                </h4>
                <div className="flex flex-wrap gap-1">
                  {activePlan.contentThemes.slice(0, 3).map((theme, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                  {activePlan.contentThemes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{activePlan.contentThemes.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            onExecute={() => onExecutePlan(plan.id)}
            onEdit={() => onEditPlan(plan)}
          />
        ))}
      </div>

      {plans.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Content Plans</h3>
            <p className="text-muted-foreground mb-4">
              Create your first weekly content plan to get started with automated scheduling.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bulk Scheduler Dialog */}
      <Dialog open={showBulkScheduler} onOpenChange={setShowBulkScheduler}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Content Generation & Scheduling</DialogTitle>
          </DialogHeader>
          {selectedPlanForExecution && (
            <BulkScheduler
              weeklyPlan={selectedPlanForExecution}
              onScheduleItems={(items) => {
                onScheduleBulkItems?.(items);
                setShowBulkScheduler(false);
                setSelectedPlanForExecution(null);
              }}
              onCancel={() => {
                setShowBulkScheduler(false);
                setSelectedPlanForExecution(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PlanCardProps {
  plan: WeeklyContentPlan;
  onExecute: () => void;
  onEdit: () => void;
}

function PlanCard({ plan, onExecute, onEdit }: PlanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{plan.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(plan.startDate, 'MMM d, yyyy')}
            </p>
          </div>
          <Badge variant={getStatusColor(plan.status) as any}>
            {plan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">Target: {plan.targetAudience}</h4>
          <div className="flex flex-wrap gap-1">
            {plan.contentThemes.slice(0, 2).map((theme, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
            {plan.contentThemes.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{plan.contentThemes.length - 2}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Settings className="w-3 h-3 mr-1" />
            Edit
          </Button>
          {plan.status !== "completed" && (
            <Button size="sm" onClick={onExecute} className="flex-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Generate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CreatePlanDialogProps {
  onCreatePlan: (plan: Omit<WeeklyContentPlan, 'id'>) => void;
  onCancel: () => void;
}

function CreatePlanDialog({ onCreatePlan, onCancel }: CreatePlanDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    goals: [] as string[],
    targetAudience: "",
    contentThemes: [] as string[],
    keyMessages: [] as string[],
    hashtags: [] as string[],
    postingSchedule: {} as WeeklyContentPlan['postingSchedule']
  });

  const [newGoal, setNewGoal] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newHashtag, setNewHashtag] = useState("");

  const addItem = (field: 'goals' | 'contentThemes' | 'keyMessages' | 'hashtags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeItem = (field: 'goals' | 'contentThemes' | 'keyMessages' | 'hashtags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePlan({
      ...formData,
      startDate: new Date(formData.startDate),
      status: "draft"
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>Create Weekly Content Plan</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              placeholder="Q1 Brand Awareness Campaign"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Week Starting</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investors">Institutional Investors</SelectItem>
                <SelectItem value="retail">Retail Crypto Holders</SelectItem>
                <SelectItem value="traders">Professional Traders</SelectItem>
                <SelectItem value="general">General Public</SelectItem>
                <SelectItem value="developers">Developers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Goals</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a goal..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('goals', newGoal);
                    setNewGoal("");
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  addItem('goals', newGoal);
                  setNewGoal("");
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.goals.map((goal, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {goal}
                  <button
                    type="button"
                    onClick={() => removeItem('goals', index)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content Themes</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a theme..."
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('contentThemes', newTheme);
                    setNewTheme("");
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  addItem('contentThemes', newTheme);
                  setNewTheme("");
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.contentThemes.map((theme, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {theme}
                  <button
                    type="button"
                    onClick={() => removeItem('contentThemes', index)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Messages */}
      <div className="space-y-2">
        <Label>Key Messages</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a key message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('keyMessages', newMessage);
                setNewMessage("");
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              addItem('keyMessages', newMessage);
              setNewMessage("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.keyMessages.map((message, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {message}
              <button
                type="button"
                onClick={() => removeItem('keyMessages', index)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Hashtags */}
      <div className="space-y-2">
        <Label>Hashtags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add hashtag (without #)..."
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('hashtags', newHashtag.replace('#', ''));
                setNewHashtag("");
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              addItem('hashtags', newHashtag.replace('#', ''));
              setNewHashtag("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.hashtags.map((hashtag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{hashtag}
              <button
                type="button"
                onClick={() => removeItem('hashtags', index)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}