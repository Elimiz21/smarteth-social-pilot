import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user is owner
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'owner') {
      console.error('Authorization error - user is not owner:', profileError);
      return new Response(
        JSON.stringify({ success: false, error: 'Only account owners can update secrets' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the credentials from the request body
    const body = await req.json();
    const { 
      TWITTER_CONSUMER_KEY, 
      TWITTER_CONSUMER_SECRET, 
      TWITTER_ACCESS_TOKEN, 
      TWITTER_ACCESS_TOKEN_SECRET 
    } = body;

    // Validate that all credentials are provided
    if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET) {
      return new Response(
        JSON.stringify({ success: false, error: 'All Twitter credentials are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Updating Twitter secrets...');

    // Update each secret using the Supabase Management API
    const secrets = [
      { name: 'TWITTER_CONSUMER_KEY', value: TWITTER_CONSUMER_KEY },
      { name: 'TWITTER_CONSUMER_SECRET', value: TWITTER_CONSUMER_SECRET },
      { name: 'TWITTER_ACCESS_TOKEN', value: TWITTER_ACCESS_TOKEN },
      { name: 'TWITTER_ACCESS_TOKEN_SECRET', value: TWITTER_ACCESS_TOKEN_SECRET }
    ];

    const projectRef = Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0];
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    for (const secret of secrets) {
      console.log(`Updating secret: ${secret.name}`);
      
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/secrets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([{
            name: secret.name,
            value: secret.value
          }])
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to update secret ${secret.name}:`, response.status, errorText);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to update ${secret.name}: ${errorText}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Successfully updated secret: ${secret.name}`);
    }

    console.log('All Twitter secrets updated successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Twitter credentials updated successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error updating Twitter secrets:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});