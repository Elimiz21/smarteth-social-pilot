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
      return new Response(JSON.stringify({ error: 'Only owners can test credentials' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { platform, service } = await req.json();

    if (!platform && !service) {
      return new Response(JSON.stringify({ error: 'Platform or service is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get secrets from database
    const getSecret = async (name: string): Promise<string | null> => {
      try {
        const { data, error } = await supabaseClient
          .from('app_secrets')
          .select('value')
          .eq('name', name)
          .single();
        
        if (error || !data) {
          console.log(`Secret ${name} not found in database`);
          return null;
        }
        
        return data.value;
      } catch (err) {
        console.error(`Error fetching secret ${name}:`, err);
        return null;
      }
    };

    let testResult: { configured: boolean; error: string | null } = { configured: false, error: null };

    try {
      if (platform) {
        // Test social media platforms
        switch (platform) {
          case 'twitter': {
            const consumerKey = await getSecret('TWITTER_CONSUMER_KEY');
            const consumerSecret = await getSecret('TWITTER_CONSUMER_SECRET');
            const accessToken = await getSecret('TWITTER_ACCESS_TOKEN');
            const accessTokenSecret = await getSecret('TWITTER_ACCESS_TOKEN_SECRET');
            
            if (consumerKey && consumerSecret && accessToken && accessTokenSecret) {
              // For Twitter, just check if credentials exist due to rate limiting
              testResult.configured = true;
              testResult.error = null;
            } else {
              testResult.error = 'Missing Twitter credentials';
            }
            break;
          }
          case 'linkedin': {
            const clientId = await getSecret('LINKEDIN_CLIENT_ID');
            const clientSecret = await getSecret('LINKEDIN_CLIENT_SECRET');
            const accessToken = await getSecret('LINKEDIN_ACCESS_TOKEN');
            
            testResult.configured = !!(clientId && clientSecret && accessToken);
            break;
          }
          case 'instagram': {
            const accessToken = await getSecret('INSTAGRAM_ACCESS_TOKEN');
            const pageId = await getSecret('INSTAGRAM_PAGE_ID');
            
            testResult.configured = !!(accessToken && pageId);
            break;
          }
          case 'telegram': {
            const botToken = await getSecret('TELEGRAM_BOT_TOKEN');
            const chatId = await getSecret('TELEGRAM_CHAT_ID');
            
            if (botToken && chatId) {
              // Test Telegram API
              try {
                const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
                const data = await response.json();
                testResult.configured = data.ok === true;
                if (!testResult.configured) {
                  testResult.error = data.description || 'Invalid bot token';
                }
              } catch (error) {
                testResult.error = 'Failed to connect to Telegram API';
              }
            }
            break;
          }
          case 'youtube': {
            const clientId = await getSecret('YOUTUBE_CLIENT_ID');
            const clientSecret = await getSecret('YOUTUBE_CLIENT_SECRET');
            const refreshToken = await getSecret('YOUTUBE_REFRESH_TOKEN');
            
            testResult.configured = !!(clientId && clientSecret && refreshToken);
            break;
          }
        }
      } else if (service) {
        // Test AI services
        switch (service) {
          case 'openai': {
            const apiKey = await getSecret('OPENAI_API_KEY');
            
            console.log('Testing OpenAI with API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'null');
            
            if (apiKey) {
              try {
                const response = await fetch('https://api.openai.com/v1/models', {
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                  },
                });
                
                console.log('OpenAI response status:', response.status);
                
                if (response.ok) {
                  testResult.configured = true;
                } else {
                  const errorText = await response.text();
                  console.log('OpenAI error response:', errorText);
                  testResult.error = `OpenAI API error: ${response.status} - ${errorText}`;
                }
              } catch (error) {
                console.error('OpenAI API connection error:', error);
                testResult.error = 'Failed to connect to OpenAI API';
              }
            } else {
              testResult.error = 'OPENAI_API_KEY not found in secrets';
            }
            break;
          }
          case 'anthropic': {
            const apiKey = await getSecret('ANTHROPIC_API_KEY');
            
            if (apiKey) {
              try {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01',
                  },
                  body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1,
                    messages: [{ role: 'user', content: 'test' }]
                  }),
                });
                testResult.configured = response.status !== 401;
                if (!testResult.configured && response.status === 401) {
                  testResult.error = 'Invalid Anthropic API key';
                }
              } catch (error) {
                testResult.error = 'Failed to connect to Anthropic API';
              }
            }
            break;
          }
          case 'gemini': {
            const apiKey = await getSecret('GEMINI_API_KEY');
            
            if (apiKey) {
              try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                testResult.configured = response.ok;
                if (!testResult.configured) {
                  testResult.error = `Gemini API error: ${response.status}`;
                }
              } catch (error) {
                testResult.error = 'Failed to connect to Gemini API';
              }
            }
            break;
          }
          case 'perplexity': {
            const apiKey = await getSecret('PERPLEXITY_API_KEY');
            
            if (apiKey) {
              try {
                const response = await fetch('https://api.perplexity.ai/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'llama-3.1-sonar-small-128k-online',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 1,
                  }),
                });
                testResult.configured = response.status !== 401;
                if (!testResult.configured && response.status === 401) {
                  testResult.error = 'Invalid Perplexity API key';
                }
              } catch (error) {
                testResult.error = 'Failed to connect to Perplexity API';
              }
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error testing credentials:', error);
      testResult.error = error.message;
    }

    return new Response(JSON.stringify(testResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in test-credentials function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});