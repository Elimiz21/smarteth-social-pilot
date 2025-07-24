import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

interface AISettingsDialogProps {
  children: React.ReactNode;
}

export function AISettingsDialog({ children }: AISettingsDialogProps) {
  const [settings, setSettings] = useState({
    temperature: "0.7",
    maxTokens: "1000",
    model: "gpt-4o-mini",
    customInstructions: "",
    apiProvider: "openai"
  });

  const handleSave = () => {
    // Save settings to localStorage or database
    localStorage.setItem('ai-content-settings', JSON.stringify(settings));
    console.log('AI settings saved:', settings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Content Settings
          </DialogTitle>
          <DialogDescription>
            Configure AI parameters for content generation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>API Provider</Label>
            <Select value={settings.apiProvider} onValueChange={(value) => setSettings(prev => ({ ...prev, apiProvider: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="google">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={settings.model} onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                <SelectItem value="gpt-4o">GPT-4O</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input 
                type="number" 
                min="0" 
                max="2" 
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings(prev => ({ ...prev, temperature: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input 
                type="number" 
                min="100" 
                max="4000"
                value={settings.maxTokens}
                onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Instructions</Label>
            <Textarea 
              placeholder="Additional instructions for the AI model..."
              value={settings.customInstructions}
              onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => console.log('Reset to defaults')}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}