import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is owner
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Only owners can update platform secrets' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { platform, secrets } = await req.json();

    if (!platform || !secrets) {
      return new Response(JSON.stringify({ error: 'Platform and secrets are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Updating ${platform} secrets:`, Object.keys(secrets));

    // In this implementation, we acknowledge the secret update request
    // The actual secrets need to be updated in Supabase Edge Function Secrets manually
    // This function validates the request and confirms the format is correct
    
    const validSecrets = [];
    for (const [secretName, secretValue] of Object.entries(secrets)) {
      if (typeof secretValue === 'string' && secretValue.trim()) {
        validSecrets.push(secretName);
        console.log(`Secret ${secretName}: ${secretValue.substring(0, 10)}...`);
      }
    }

    if (validSecrets.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No valid secrets provided',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${platform} secrets received and validated. Please update them manually in Supabase Edge Function Secrets.`,
      updated_count: validSecrets.length,
      secrets: validSecrets
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-platform-secrets function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});