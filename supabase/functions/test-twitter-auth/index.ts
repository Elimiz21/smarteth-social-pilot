import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to get secrets from database
async function getTwitterCredentials() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

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

async function testTwitterAuth(): Promise<any> {
  // Get credentials from database
  const credentials = await getTwitterCredentials();
  
  if (!credentials) {
    throw new Error('Failed to fetch Twitter credentials from database');
  }

  // Check if all credentials are present
  if (!credentials.API_KEY || !credentials.API_SECRET || !credentials.ACCESS_TOKEN || !credentials.ACCESS_TOKEN_SECRET) {
    const missing = [];
    if (!credentials.API_KEY) missing.push("TWITTER_CONSUMER_KEY");
    if (!credentials.API_SECRET) missing.push("TWITTER_CONSUMER_SECRET");
    if (!credentials.ACCESS_TOKEN) missing.push("TWITTER_ACCESS_TOKEN");
    if (!credentials.ACCESS_TOKEN_SECRET) missing.push("TWITTER_ACCESS_TOKEN_SECRET");
    
    throw new Error(`Missing Twitter credentials: ${missing.join(", ")}`);
  }

  console.log("Testing Twitter authentication...");
  console.log("Credentials check:", {
    hasApiKey: !!credentials.API_KEY,
    hasApiSecret: !!credentials.API_SECRET,
    hasAccessToken: !!credentials.ACCESS_TOKEN,
    hasAccessTokenSecret: !!credentials.ACCESS_TOKEN_SECRET,
    apiKeyLength: credentials.API_KEY?.length,
    accessTokenLength: credentials.ACCESS_TOKEN?.length
  });

  // Test with a simple GET request to verify credentials
  const url = "https://api.x.com/2/users/me";
  const method = "GET";
  
  const oauthHeader = generateOAuthHeader(method, url, credentials);
  console.log("Generated OAuth Header:", oauthHeader);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
  });

  const responseText = await response.text();
  console.log("Twitter API Response Status:", response.status);
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
    console.log("Starting Twitter authentication test...");
    
    const result = await testTwitterAuth();
    
    console.log("Twitter authentication successful!");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Twitter authentication successful",
        user_data: result
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Twitter authentication failed:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: "Check the function logs for more details"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});