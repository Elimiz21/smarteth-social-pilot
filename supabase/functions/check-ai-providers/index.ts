import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for app secrets access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authentication token for user verification
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('Authorization token required');
    }

    // Verify user with a separate client
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const { data: { user }, error: authError } = await userClient.auth.getUser(authHeader);
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication token');
    }

    // Check which API keys are configured
    const { data: secrets, error } = await supabaseClient
      .from('app_secrets')
      .select('name')
      .in('name', ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'PERPLEXITY_API_KEY']);

    if (error) {
      throw new Error(`Failed to check API keys: ${error.message}`);
    }

    const configuredKeys = secrets?.map(s => s.name) || [];
    
    // Map API keys to provider info
    const availableProviders = [];
    
    if (configuredKeys.includes('OPENAI_API_KEY')) {
      availableProviders.push({ 
        id: "openai", 
        name: "OpenAI GPT-4", 
        recommended: true 
      });
    }
    
    if (configuredKeys.includes('ANTHROPIC_API_KEY')) {
      availableProviders.push({ 
        id: "claude", 
        name: "Anthropic Claude", 
        recommended: true 
      });
    }
    
    if (configuredKeys.includes('PERPLEXITY_API_KEY')) {
      availableProviders.push({ 
        id: "perplexity", 
        name: "Perplexity AI" 
      });
    }

    return new Response(JSON.stringify({ availableProviders }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in check-ai-providers function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});