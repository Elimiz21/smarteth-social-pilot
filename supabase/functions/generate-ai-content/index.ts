import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getApiKey(supabaseClient: any, keyName: string) {
  console.log(`Attempting to fetch API key: ${keyName}`);
  const { data, error } = await supabaseClient
    .from('app_secrets')
    .select('value')
    .eq('name', keyName)
    .single();

  if (error || !data?.value) {
    console.error(`Failed to get ${keyName}:`, error);
    throw new Error(`${keyName} not configured. Please add this API key in your Supabase secrets. Error: ${error?.message || 'No value found'}`);
  }

  console.log(`Successfully retrieved ${keyName}`);
  return data.value;
}

async function callOpenAI(apiKey: string, fullPrompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
  console.log('OpenAI API response status:', response.status);
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data;
}

async function callPerplexity(apiKey: string, fullPrompt: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert content creator specializing in cryptocurrency and financial marketing. Generate engaging, compliant content that resonates with the target audience. Always return valid JSON array format.'
        },
        { role: 'user', content: fullPrompt }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: false,
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  const data = await response.json();
  console.log('Perplexity API response status:', response.status);
  console.log('Perplexity API response data:', JSON.stringify(data));
  
  if (!response.ok) {
    throw new Error(`Perplexity API error: ${data.error?.message || data.message || 'Unknown error'}`);
  }

  return data;
}

async function callAnthropic(apiKey: string, fullPrompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { 
          role: 'user', 
          content: `You are an expert content creator specializing in cryptocurrency and financial marketing. Generate engaging, compliant content that resonates with the target audience. Always return valid JSON array format.\n\n${fullPrompt}`
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  console.log('Anthropic API response status:', response.status);
  
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`);
  }

  // Convert Anthropic response format to OpenAI-like format
  return {
    choices: [{
      message: {
        content: data.content[0].text
      }
    }]
  };
}

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

    console.log('User authenticated:', user.id);

    const { 
      aiProvider = 'perplexity',
      contentPrompt, 
      contentType, 
      targetAudience, 
      tone, 
      keywords,
      specificRequirements,
      complianceGuidelines,
      callToAction
    } = await req.json();

    console.log('Selected AI Provider:', aiProvider);

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

    let data;
    let apiKey;

    // Route to the appropriate AI provider
    switch (aiProvider) {
      case 'openai':
        try {
          apiKey = await getApiKey(supabaseClient, 'OPENAI_API_KEY');
          data = await callOpenAI(apiKey, fullPrompt);
        } catch (error) {
          console.error('OpenAI error:', error);
          throw new Error(`OpenAI unavailable: ${error.message}. Please try Perplexity instead.`);
        }
        break;
      
      case 'perplexity':
        try {
          apiKey = await getApiKey(supabaseClient, 'PERPLEXITY_API_KEY');
          data = await callPerplexity(apiKey, fullPrompt);
        } catch (error) {
          console.error('Perplexity error:', error);
          throw new Error(`Perplexity API error: ${error.message}`);
        }
        break;
      
      case 'claude':
        try {
          apiKey = await getApiKey(supabaseClient, 'ANTHROPIC_API_KEY');
          data = await callAnthropic(apiKey, fullPrompt);
        } catch (error) {
          console.error('Claude error:', error);
          throw new Error(`Claude unavailable: ${error.message}`);
        }
        break;
      
      default:
        throw new Error(`Unsupported AI provider: ${aiProvider}. Supported providers: openai, perplexity, claude`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(`Invalid response format from ${aiProvider} API`);
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