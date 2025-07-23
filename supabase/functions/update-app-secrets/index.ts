import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's token and get their profile
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is an owner
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'owner') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Owner role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { platform, secrets } = await req.json();

    if (!platform || !secrets || typeof secrets !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid platform/secrets data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate secrets are non-empty
    for (const [key, value] of Object.entries(secrets)) {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return new Response(
          JSON.stringify({ error: `Secret ${key} cannot be empty` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Updating secrets for platform: ${platform}`);

    // Update or insert each secret
    const updates = [];
    for (const [secretName, secretValue] of Object.entries(secrets)) {
      console.log(`Processing secret: ${secretName}`);
      
      const { error: upsertError } = await supabase
        .from('app_secrets')
        .upsert({
          name: secretName,
          value: secretValue,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'name'
        });

      if (upsertError) {
        console.error(`Error updating secret ${secretName}:`, upsertError);
        return new Response(
          JSON.stringify({ error: `Failed to update secret ${secretName}: ${upsertError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      updates.push(secretName);
    }

    console.log(`Successfully updated secrets: ${updates.join(', ')}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully updated ${updates.length} secret(s) for ${platform}`,
        updated_secrets: updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-app-secrets function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});