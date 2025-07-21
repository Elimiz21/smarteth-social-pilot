import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Auto-scheduler: Checking for posts ready to publish...');

    // Get posts ready for publishing
    const { data: readyPosts, error: postsError } = await supabase.rpc('get_posts_ready_for_publishing');
    
    if (postsError) {
      console.error('Error fetching ready posts:', postsError);
      throw postsError;
    }

    console.log(`Found ${readyPosts?.length || 0} posts ready for publishing`);

    if (!readyPosts || readyPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts ready for publishing', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processed = 0;

    for (const post of readyPosts) {
      try {
        console.log(`Processing post ${post.id} for platforms:`, post.platforms);

        // Update post status to processing
        await supabase
          .from('scheduled_posts')
          .update({ status: 'processing' })
          .eq('id', post.id);

        // Get executions for this post
        const { data: executions, error: execError } = await supabase
          .from('post_executions')
          .select('*')
          .eq('scheduled_post_id', post.id)
          .eq('status', 'pending');

        if (execError) {
          console.error('Error fetching executions:', execError);
          continue;
        }

        // Process each platform execution
        for (const execution of executions || []) {
          try {
            console.log(`Processing execution ${execution.id} for platform ${execution.platform}`);

            if (execution.platform === 'twitter') {
              // Call Twitter posting function
              const response = await supabase.functions.invoke('post-to-twitter', {
                body: {
                  execution_id: execution.id,
                  content: post.content
                }
              });

              if (response.error) {
                console.error('Twitter posting error:', response.error);
              } else {
                console.log('Twitter posting successful:', response.data);
              }
            }
            // Add other platforms here as needed
          } catch (execError) {
            console.error(`Error processing execution ${execution.id}:`, execError);
            
            // Update execution with error
            await supabase.rpc('update_post_execution_status', {
              p_execution_id: execution.id,
              p_status: 'failed',
              p_error_message: execError.message
            });
          }
        }

        processed++;
      } catch (postError) {
        console.error(`Error processing post ${post.id}:`, postError);
        
        // Update post status to failed
        await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'failed',
            error_message: postError.message 
          })
          .eq('id', post.id);
      }
    }

    console.log(`Auto-scheduler: Processed ${processed} posts`);

    return new Response(
      JSON.stringify({ 
        message: `Processed ${processed} posts`,
        processed 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Auto-scheduler error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});