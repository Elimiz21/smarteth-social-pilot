import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    // Initialize Supabase client with user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authentication token
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('Authorization token required');
    }

    // Set the auth token for the client
    await supabaseClient.auth.setSession({
      access_token: authHeader,
      refresh_token: ''
    });

    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication token');
    }

    console.log('User authenticated:', user.id);

    // Get OpenAI API key from database
    console.log('Fetching OpenAI API key from app_secrets table...');
    const { data: secretData, error: secretError } = await supabaseClient
      .from('app_secrets')
      .select('value')
      .eq('name', 'OPENAI_API_KEY')
      .single();

    console.log('Secret query result:', { secretData, secretError });

    if (secretError || !secretData?.value) {
      console.error('Failed to get OpenAI API key:', secretError);
      throw new Error(`OpenAI API key not configured. Error: ${secretError?.message || 'No value found'}`);
    }

    const openAIApiKey = secretData.value;
    console.log('OpenAI API Key status:', openAIApiKey ? 'Found in database' : 'Not found');
    console.log('API Key prefix:', openAIApiKey ? openAIApiKey.substring(0, 10) + '...' : 'N/A');
    const { 
      contentPrompt, 
      contentType, 
      targetAudience, 
      tone, 
      keywords,
      specificRequirements,
      complianceGuidelines,
      callToAction
    } = await req.json();

    const fullPrompt = `
${contentPrompt}

Content Type: ${contentType}
Target Audience: ${targetAudience}
Tone: ${tone}
Keywords: ${keywords || 'N/A'}

Specific Requirements:
${specificRequirements || 'N/A'}

Compliance Guidelines:
${complianceGuidelines || 'N/A'}

Call-to-Action: ${callToAction || 'N/A'}

Please generate 3 different versions of content that:
1. Aligns with the strategy and target audience
2. Uses the specified tone and includes relevant keywords
3. Follows compliance guidelines
4. Includes the call-to-action where appropriate
5. Is optimized for the specified content type and platform

Return the response as a JSON array with 3 objects, each containing:
- content: the generated text
- engagementScore: estimated engagement score (1-10)
- characterCount: number of characters
- suggestedHashtags: array of relevant hashtags
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content creator specializing in cryptocurrency and financial marketing. Generate engaging, compliant content that resonates with the target audience. Always return valid JSON array format.'
          },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response:', data);
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    let generatedContent;

    try {
      // Try to parse the AI response as JSON
      generatedContent = JSON.parse(data.choices[0].message.content);
    } catch {
      // If parsing fails, create structured response from the text
      const content = data.choices[0].message.content;
      generatedContent = [
        {
          content: content,
          engagementScore: Math.floor(Math.random() * 3) + 7, // 7-9
          characterCount: content.length,
          suggestedHashtags: ['#SmartETH', '#Crypto', '#Investment']
        }
      ];
    }

    return new Response(JSON.stringify({ generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});