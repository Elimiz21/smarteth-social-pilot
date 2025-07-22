import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const TwitterTestButton = () => {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testTwitterCredentials = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-twitter-auth', {});
      
      if (error) {
        console.error('Error testing Twitter credentials:', error);
        toast({
          title: "Twitter Test Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.success) {
        toast({
          title: "Twitter Credentials Valid!",
          description: `Connected as: ${data.user_data?.data?.name || 'User'}`,
        });
      } else {
        toast({
          title: "Twitter Test Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Error:', err);
      toast({
        title: "Test Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button 
      onClick={testTwitterCredentials} 
      disabled={testing}
      variant="outline"
    >
      {testing ? "Testing..." : "Test Twitter Credentials"}
    </Button>
  );
};