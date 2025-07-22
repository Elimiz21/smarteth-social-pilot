import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to get secrets from database
async function getTwitterCredentials() {
  const { data, error } = await supabase
    .from('app_secrets')
    .select('name, value')
    .in('name', ['TWITTER_CONSUMER_KEY', 'TWITTER_CONSUMER_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_TOKEN_SECRET']);

  if (error) {
    console.error('Error fetching secrets:', error);
    return null;
  }

  const secrets: Record<string, string> = {};
  data.forEach(secret => {
    secrets[secret.name] = secret.value;
  });

  return {
    API_KEY: secrets.TWITTER_CONSUMER_KEY?.trim(),
    API_SECRET: secrets.TWITTER_CONSUMER_SECRET?.trim(),
    ACCESS_TOKEN: secrets.TWITTER_ACCESS_TOKEN?.trim(),
    ACCESS_TOKEN_SECRET: secrets.TWITTER_ACCESS_TOKEN_SECRET?.trim()
  };
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  return signature;
}

function generateOAuthHeader(method: string, url: string, credentials: any): string {
  const oauthParams = {
    oauth_consumer_key: credentials.API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    credentials.API_SECRET!,
    credentials.ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function sendTweet(tweetText: string): Promise<any> {
  // Get credentials from database
  const credentials = await getTwitterCredentials();
  
  if (!credentials) {
    throw new Error('Failed to fetch Twitter credentials from database');
  }

  // Validate credentials
  if (!credentials.API_KEY || !credentials.API_SECRET || !credentials.ACCESS_TOKEN || !credentials.ACCESS_TOKEN_SECRET) {
    console.error("Missing Twitter credentials:", {
      hasApiKey: !!credentials.API_KEY,
      hasApiSecret: !!credentials.API_SECRET,
      hasAccessToken: !!credentials.ACCESS_TOKEN,
      hasAccessTokenSecret: !!credentials.ACCESS_TOKEN_SECRET
    });
    throw new Error("Missing Twitter API credentials");
  }

  const url = "https://api.x.com/2/tweets";
  const method = "POST";
  const params = { text: tweetText };

  const oauthHeader = generateOAuthHeader(method, url, credentials);
  console.log("Sending tweet:", tweetText);
  console.log("OAuth Header:", oauthHeader);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseText = await response.text();
  console.log("Twitter API Response:", responseText);

  if (!response.ok) {
    throw new Error(
      `Twitter API error! status: ${response.status}, body: ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { execution_id, content } = await req.json();
    
    if (!execution_id || !content) {
      throw new Error('execution_id and content are required');
    }

    console.log(`Processing Twitter post for execution ${execution_id}`);

    // Update status to processing
    await supabase
      .from('post_executions')
      .update({ status: 'processing' })
      .eq('id', execution_id);

    // Send the tweet
    const twitterResponse = await sendTweet(content);
    
    // Update execution with success
    const { error: updateError } = await supabase.rpc('update_post_execution_status', {
      p_execution_id: execution_id,
      p_status: 'success',
      p_external_post_id: twitterResponse.data?.id,
      p_external_url: twitterResponse.data?.id ? `https://twitter.com/i/web/status/${twitterResponse.data.id}` : null,
      p_response_data: twitterResponse
    });

    if (updateError) {
      console.error('Error updating execution status:', updateError);
      throw updateError;
    }

    console.log(`Successfully posted to Twitter for execution ${execution_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        twitter_response: twitterResponse,
        external_url: twitterResponse.data?.id ? `https://twitter.com/i/web/status/${twitterResponse.data.id}` : null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error posting to Twitter:", error);
    
    // Try to update the execution with the error
    try {
      const { execution_id } = await req.json();
      if (execution_id) {
        await supabase.rpc('update_post_execution_status', {
          p_execution_id: execution_id,
          p_status: 'failed',
          p_error_message: error.message
        });
      }
    } catch (updateError) {
      console.error("Error updating failed execution:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});