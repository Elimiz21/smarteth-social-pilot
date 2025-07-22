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

    // Parse query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = url.searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const type = url.searchParams.get('type') || 'overview';

    console.log(`Fetching analytics for user ${user.id}, type: ${type}, dates: ${startDate} to ${endDate}`);

    let result = {};

    switch (type) {
      case 'posts':
        const { data: postData, error: postError } = await supabase
          .rpc('get_post_analytics', {
            start_date: startDate,
            end_date: endDate,
            user_filter: user.id
          });

        if (postError) {
          console.error('Error fetching post analytics:', postError);
          throw postError;
        }

        result = {
          type: 'posts',
          data: postData?.[0] || {
            total_posts: 0,
            published_posts: 0,
            failed_posts: 0,
            success_rate: 0,
            platform_stats: [],
            daily_stats: []
          }
        };
        break;

      case 'schedule':
        const { data: scheduleData, error: scheduleError } = await supabase
          .rpc('get_schedule_analytics', {
            start_date: startDate,
            end_date: endDate,
            user_filter: user.id
          });

        if (scheduleError) {
          console.error('Error fetching schedule analytics:', scheduleError);
          throw scheduleError;
        }

        result = {
          type: 'schedule',
          data: scheduleData?.[0] || {
            hourly_distribution: [],
            day_of_week_distribution: [],
            optimal_posting_times: []
          }
        };
        break;

      case 'engagement':
        const { data: engagementData, error: engagementError } = await supabase
          .rpc('get_engagement_analytics', {
            start_date: startDate,
            end_date: endDate,
            user_filter: user.id
          });

        if (engagementError) {
          console.error('Error fetching engagement analytics:', engagementError);
          throw engagementError;
        }

        result = {
          type: 'engagement',
          data: engagementData?.[0] || {
            avg_engagement_rate: 0,
            top_performing_posts: [],
            platform_engagement: []
          }
        };
        break;

      case 'overview':
      default:
        // Fetch all analytics types for overview
        const [postAnalytics, scheduleAnalytics, engagementAnalytics] = await Promise.all([
          supabase.rpc('get_post_analytics', {
            start_date: startDate,
            end_date: endDate,
            user_filter: user.id
          }),
          supabase.rpc('get_schedule_analytics', {
            start_date: startDate,
            end_date: endDate,
            user_filter: user.id
          }),
          supabase.rpc('get_engagement_analytics', {
            start_date: startDate,
            end_date: endDate,
            user_filter: user.id
          })
        ]);

        if (postAnalytics.error) {
          console.error('Error fetching post analytics:', postAnalytics.error);
          throw postAnalytics.error;
        }
        if (scheduleAnalytics.error) {
          console.error('Error fetching schedule analytics:', scheduleAnalytics.error);
          throw scheduleAnalytics.error;
        }
        if (engagementAnalytics.error) {
          console.error('Error fetching engagement analytics:', engagementAnalytics.error);
          throw engagementAnalytics.error;
        }

        result = {
          type: 'overview',
          data: {
            posts: postAnalytics.data?.[0] || {
              total_posts: 0,
              published_posts: 0,
              failed_posts: 0,
              success_rate: 0,
              platform_stats: [],
              daily_stats: []
            },
            schedule: scheduleAnalytics.data?.[0] || {
              hourly_distribution: [],
              day_of_week_distribution: [],
              optimal_posting_times: []
            },
            engagement: engagementAnalytics.data?.[0] || {
              avg_engagement_rate: 0,
              top_performing_posts: [],
              platform_engagement: []
            }
          }
        };
        break;
    }

    console.log('Analytics data fetched successfully');

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in analytics function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});