import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      ai_prompt,
      search_query,
      search_type,
      strategy_context,
      content_pillars,
      brand_voice,
      current_campaigns,
      action_type
    } = await req.json();

    // Build comprehensive context for AI
    const contextPrompt = `
You are an expert social media strategist creating ${action_type === 'reply' ? 'tweet replies' : 'social media posts'} for a brand.

SEARCH CONTEXT:
- Search Type: ${search_type}
- Search Query: "${search_query}"
- Action: ${action_type === 'reply' ? 'Reply to tweets found in this search' : 'Create posts related to this search'}

BRAND STRATEGY CONTEXT:
${strategy_context ? `Overall Strategy: ${strategy_context}` : ''}
${content_pillars ? `Content Pillars: ${content_pillars}` : ''}
${brand_voice ? `Brand Voice & Tone: ${brand_voice}` : ''}
${current_campaigns ? `Current Campaigns: ${current_campaigns}` : ''}

SPECIFIC INSTRUCTIONS:
${ai_prompt}

REQUIREMENTS:
${action_type === 'reply' ? `
- Generate 5-8 different reply variations
- Keep replies under 280 characters
- Be engaging and add value to the conversation
- Stay relevant to the search topic: "${search_query}"
- Match the brand voice and strategy provided
- Include relevant hashtags or mentions where appropriate
- Avoid being overly promotional - focus on genuine engagement
` : `
- Generate 5-8 different post variations
- Keep posts under 280 characters
- Be engaging and drive conversation
- Stay relevant to the search topic: "${search_query}"
- Match the brand voice and strategy provided
- Include relevant hashtags
- Encourage engagement through questions or calls-to-action
`}

Generate only the ${action_type === 'reply' ? 'replies' : 'posts'} themselves, one per line, without numbering or additional formatting.
`;

    console.log('Generating AI replies with context:', {
      search_query,
      search_type,
      action_type,
      has_strategy: !!strategy_context,
      has_brand_voice: !!brand_voice
    });

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
            content: 'You are an expert social media strategist and copywriter. Generate engaging, strategic social media content that aligns with brand voice and objectives.'
          },
          { 
            role: 'user', 
            content: contextPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parse the generated text into individual replies
    const replies = generatedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\.?\s/)) // Remove numbered lines
      .slice(0, 8); // Limit to 8 replies max

    console.log(`Generated ${replies.length} AI replies`);

    return new Response(JSON.stringify({ 
      replies,
      context_used: {
        search_query,
        search_type,
        action_type,
        has_strategy_context: !!strategy_context,
        has_brand_voice: !!brand_voice
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-replies function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate AI replies. Please check your configuration and try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});