import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Save, Eye, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const strategySchema = z.object({
  name: z.string().min(1, "Strategy name is required"),
  description: z.string().optional(),
  target_audience: z.string().min(1, "Target audience is required"),
  key_messaging: z.string().min(1, "Key messaging is required"),
  content_themes: z.string().min(1, "Content themes are required"),
  objectives: z.array(z.string()).default([]),
  metrics: z.array(z.string()).default([]),
});

type Strategy = z.infer<typeof strategySchema> & {
  id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function Strategy() {
  const { user } = useAuth();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof strategySchema>>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: "",
      description: "",
      target_audience: "",
      key_messaging: "",
      content_themes: "",
      objectives: [],
      metrics: [],
    },
  });

  const loadStrategy = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading strategy:', error);
        return;
      }

      if (data) {
        setStrategy(data);
        form.reset({
          name: data.name,
          description: data.description || "",
          target_audience: data.target_audience || "",
          key_messaging: data.key_messaging || "",
          content_themes: data.content_themes || "",
          objectives: data.objectives || [],
          metrics: data.metrics || [],
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategy();
  }, [user]);

  const onSubmit = async (values: z.infer<typeof strategySchema>) => {
    if (!user) return;

    try {
      if (strategy?.id) {
        // Update existing strategy
        const { error } = await supabase
          .from('strategies')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', strategy.id);

        if (error) throw error;
        toast.success("Strategy updated successfully");
      } else {
        // Create new strategy
        const { error } = await supabase
          .from('strategies')
          .insert({
            ...values,
            user_id: user.id,
            is_active: true,
          });

        if (error) throw error;
        toast.success("Strategy created successfully");
      }

      setIsEditDialogOpen(false);
      loadStrategy();
    } catch (error) {
      console.error('Error saving strategy:', error);
      toast.error("Failed to save strategy");
    }
  };

  const addObjective = () => {
    const currentObjectives = form.getValues('objectives');
    form.setValue('objectives', [...currentObjectives, '']);
  };

  const removeObjective = (index: number) => {
    const currentObjectives = form.getValues('objectives');
    form.setValue('objectives', currentObjectives.filter((_, i) => i !== index));
  };

  const addMetric = () => {
    const currentMetrics = form.getValues('metrics');
    form.setValue('metrics', [...currentMetrics, '']);
  };

  const removeMetric = (index: number) => {
    const currentMetrics = form.getValues('metrics');
    form.setValue('metrics', currentMetrics.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Marketing Strategy
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage global marketing strategy and content guidelines
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Edit className="w-4 h-4 mr-2" />
                {strategy ? 'Edit Strategy' : 'Create Strategy'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{strategy ? 'Edit Strategy' : 'Create Strategy'}</DialogTitle>
                <DialogDescription>
                  Define your marketing strategy to guide content creation and campaigns.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strategy Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SmartETH Fundraising Strategy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your strategy..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target_audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your target audience..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="key_messaging"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Messaging</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Define your core messaging..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content_themes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Themes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List your main content themes..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Objectives</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addObjective}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Objective
                      </Button>
                    </div>
                    
                    {form.watch('objectives').map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`objectives.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Enter objective..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeObjective(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Success Metrics</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Metric
                      </Button>
                    </div>
                    
                    {form.watch('metrics').map((_, index) => (
                      <div key={index} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`metrics.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Enter success metric..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeMetric(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      {strategy ? 'Update Strategy' : 'Create Strategy'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {strategy ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {strategy.name}
            </CardTitle>
            <CardDescription>
              {strategy.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Target Audience</h3>
              <p className="text-sm text-muted-foreground">
                {strategy.target_audience}
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Key Messaging</h3>
              <p className="text-sm text-muted-foreground">
                {strategy.key_messaging}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Content Themes</h3>
              <p className="text-sm text-muted-foreground">
                {strategy.content_themes}
              </p>
            </div>

            {strategy.objectives && strategy.objectives.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Objectives</h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.objectives.map((objective, index) => (
                    <Badge key={index} variant="secondary">
                      {objective}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {strategy.metrics && strategy.metrics.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Success Metrics</h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.metrics.map((metric, index) => (
                    <Badge key={index} variant="outline">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Strategy Defined</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your marketing strategy to guide content creation and campaigns.
            </p>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}