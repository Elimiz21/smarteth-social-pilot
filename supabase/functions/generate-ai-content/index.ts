import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getApiKey(supabaseClient: any, keyName: string) {
  console.log(`Attempting to fetch API key: ${keyName}`);

  // First, attempt to read the key from the database table
  let dbValue: string | null = null;
  try {
    const { data, error } = await supabaseClient
      .from('app_secrets')
      .select('value')
      .eq('name', keyName)
      .maybeSingle();
    if (error) {
      console.error(`Database error getting ${keyName}:`, error);
      throw new Error(`Database error fetching ${keyName}: ${error.message}`);
    }
    dbValue = data?.value ?? null;
  } catch (dbErr) {
    console.warn(`Error querying app_secrets for ${keyName}:`, dbErr);
  }

  // If not found in the DB, fall back to environment variables
  if (!dbValue) {
    const envValue = Deno.env.get(keyName);
    if (envValue) {
      console.log(`Using ${keyName} from environment variables`);
      return envValue;
    }
    console.error(`${keyName} not found in database or environment`);
    throw new Error(`${keyName} not configured. Please add this API key in your Supabase secrets or environment variables.`);
  }

  console.log(`Successfully retrieved ${keyName} from database`);
  return dbValue;
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
  console.log('Calling Perplexity API...');
  console.log('API Key length:', apiKey ? apiKey.length : 'undefined');
  console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');
  
  if (!apiKey) {
    throw new Error('Perplexity API key is missing');
  }
  
  const requestBody = {
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
  };

  console.log('Perplexity request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Perplexity API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      const errorMsg = errorData.error?.message || errorData.message || errorData.detail || `HTTP ${response.status}: ${errorText}`;
      throw new Error(`Perplexity API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    console.log('Perplexity API response data:', JSON.stringify(data, null, 2));
    return data;
    
  } catch (error) {
    console.error('Perplexity API call failed:', error);
    throw error;
  }
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
      apiKeys = {},
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

    /**
     * Helper function to attempt a provider call. Returns the data if
     * successful, otherwise returns undefined. This allows the main switch
     * logic to implement provider fallbacks when an API key is missing or
     * the call throws an error.
     */
    async function tryProvider(provider: string): Promise<any | undefined> {
      try {
        let overrideKey: string | undefined;
        // Check if the client provided an override API key for this provider
        if (apiKeys) {
          if (provider === 'openai' && apiKeys.OPENAI_API_KEY) {
            overrideKey = apiKeys.OPENAI_API_KEY;
          } else if (provider === 'perplexity' && apiKeys.PERPLEXITY_API_KEY) {
            overrideKey = apiKeys.PERPLEXITY_API_KEY;
          } else if (provider === 'claude' && apiKeys.ANTHROPIC_API_KEY) {
            overrideKey = apiKeys.ANTHROPIC_API_KEY;
          }
        }
        switch (provider) {
          case 'openai': {
            const key = overrideKey ?? await getApiKey(supabaseClient, 'OPENAI_API_KEY');
            if (!key) return undefined;
            return await callOpenAI(key, fullPrompt);
          }
          case 'perplexity': {
            const key = overrideKey ?? await getApiKey(supabaseClient, 'PERPLEXITY_API_KEY');
            if (!key) return undefined;
            return await callPerplexity(key, fullPrompt);
          }
          case 'claude': {
            const key = overrideKey ?? await getApiKey(supabaseClient, 'ANTHROPIC_API_KEY');
            if (!key) return undefined;
            return await callAnthropic(key, fullPrompt);
          }
          default:
            return undefined;
        }
      } catch (providerErr) {
        console.error(`${provider} provider error:`, providerErr);
        return undefined;
      }
    }

    // Determine the order of providers to attempt. Always try the requested
    // provider first, then fall back to OpenAI, Perplexity, Claude in that
    // order. This ensures a best-effort attempt even if the preferred
    // provider lacks a configured API key.
    const providerOrder = [] as string[];
    if (['openai', 'perplexity', 'claude'].includes(aiProvider)) {
      providerOrder.push(aiProvider);
    }
    // Append fallback providers, ensuring no duplicates
    ['openai', 'perplexity', 'claude'].forEach((p) => {
      if (!providerOrder.includes(p)) providerOrder.push(p);
    });

    // Iterate through providers until one succeeds
    for (const provider of providerOrder) {
      const result = await tryProvider(provider);
      if (result) {
        data = result;
        break;
      }
    }

    if (!data) {
      // No providers are configured or all provider calls failed. Instead of
      // returning an error, generate simple placeholder content so the user
      // still receives a response. This avoids the function returning a non
      // 2xx status and guides the user to configure their API keys.
      console.warn('No AI providers configured; generating placeholder content.');
      const placeholderTexts = [
        `We're unable to generate AI content right now. Please ensure your AI provider keys are configured. Meanwhile, here is a summary of your prompt:\n\n${contentPrompt}`,
        `AI content generation is temporarily unavailable. Configure your API keys to enable this feature. Your original prompt was:\n\n${contentPrompt}`,
        `No AI provider is available. Once you set up an API key, you'll get tailored content here. Prompt:\n\n${contentPrompt}`
      ];
      const fallbackContent = placeholderTexts.map((text) => ({
        content: text,
        engagementScore: 5,
        characterCount: text.length,
        suggestedHashtags: ['#SmartETH', '#AIContent', '#ConfigureAPI']
      }));
      return new Response(JSON.stringify({ generatedContent: fallbackContent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    // Always return a 200 so that the Supabase JS client treats this as a
    // successful response. The error message will be included in the body
    // under the `error` property and can be handled on the client.
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
