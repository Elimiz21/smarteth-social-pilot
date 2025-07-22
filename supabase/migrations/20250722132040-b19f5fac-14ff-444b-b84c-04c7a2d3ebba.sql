-- Create analytics functions and views for the social media scheduler

-- Function to get post analytics by date range
CREATE OR REPLACE FUNCTION public.get_post_analytics(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE,
  user_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  total_posts bigint,
  published_posts bigint,
  failed_posts bigint,
  success_rate numeric,
  platform_stats jsonb,
  daily_stats jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH post_summary AS (
    SELECT 
      sp.id,
      sp.status,
      sp.platforms,
      sp.published_at::date as publish_date,
      sp.user_id
    FROM public.scheduled_posts sp
    WHERE sp.created_at::date BETWEEN start_date AND end_date
      AND (user_filter IS NULL OR sp.user_id = user_filter)
  ),
  platform_breakdown AS (
    SELECT 
      platform,
      COUNT(*) as platform_count,
      COUNT(CASE WHEN ps.status = 'published' THEN 1 END) as platform_published
    FROM post_summary ps
    CROSS JOIN LATERAL unnest(ps.platforms) AS platform
    GROUP BY platform
  ),
  daily_breakdown AS (
    SELECT 
      publish_date,
      COUNT(*) as daily_count,
      COUNT(CASE WHEN status = 'published' THEN 1 END) as daily_published
    FROM post_summary
    WHERE publish_date IS NOT NULL
    GROUP BY publish_date
    ORDER BY publish_date
  )
  SELECT 
    (SELECT COUNT(*) FROM post_summary)::bigint as total_posts,
    (SELECT COUNT(*) FROM post_summary WHERE status = 'published')::bigint as published_posts,
    (SELECT COUNT(*) FROM post_summary WHERE status = 'failed')::bigint as failed_posts,
    CASE 
      WHEN (SELECT COUNT(*) FROM post_summary) > 0 
      THEN ROUND(((SELECT COUNT(*) FROM post_summary WHERE status = 'published')::numeric / (SELECT COUNT(*) FROM post_summary)::numeric) * 100, 2)
      ELSE 0
    END as success_rate,
    (SELECT jsonb_agg(
      jsonb_build_object(
        'platform', platform,
        'count', platform_count,
        'published', platform_published,
        'success_rate', 
        CASE WHEN platform_count > 0 
          THEN ROUND((platform_published::numeric / platform_count::numeric) * 100, 2)
          ELSE 0 
        END
      )
    ) FROM platform_breakdown) as platform_stats,
    (SELECT jsonb_agg(
      jsonb_build_object(
        'date', publish_date,
        'total', daily_count,
        'published', daily_published
      ) ORDER BY publish_date
    ) FROM daily_breakdown) as daily_stats;
END;
$$;

-- Function to get engagement metrics (placeholder for future implementation)
CREATE OR REPLACE FUNCTION public.get_engagement_analytics(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE,
  user_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  avg_engagement_rate numeric,
  top_performing_posts jsonb,
  platform_engagement jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a placeholder for future engagement tracking
  -- In a real implementation, you'd track likes, shares, comments, etc.
  RETURN QUERY
  SELECT 
    0::numeric as avg_engagement_rate,
    '[]'::jsonb as top_performing_posts,
    '[]'::jsonb as platform_engagement;
END;
$$;

-- Function to get posting schedule insights
CREATE OR REPLACE FUNCTION public.get_schedule_analytics(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE,
  user_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  hourly_distribution jsonb,
  day_of_week_distribution jsonb,
  optimal_posting_times jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH schedule_data AS (
    SELECT 
      EXTRACT(hour FROM sp.scheduled_time) as hour,
      EXTRACT(dow FROM sp.scheduled_time) as day_of_week,
      sp.status,
      sp.scheduled_time
    FROM public.scheduled_posts sp
    WHERE sp.scheduled_time::date BETWEEN start_date AND end_date
      AND (user_filter IS NULL OR sp.user_id = user_filter)
  ),
  hourly_stats AS (
    SELECT 
      hour,
      COUNT(*) as total_posts,
      COUNT(CASE WHEN status = 'published' THEN 1 END) as successful_posts
    FROM schedule_data
    GROUP BY hour
    ORDER BY hour
  ),
  daily_stats AS (
    SELECT 
      day_of_week,
      CASE day_of_week
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
      END as day_name,
      COUNT(*) as total_posts,
      COUNT(CASE WHEN status = 'published' THEN 1 END) as successful_posts
    FROM schedule_data
    GROUP BY day_of_week
    ORDER BY day_of_week
  )
  SELECT 
    (SELECT jsonb_agg(
      jsonb_build_object(
        'hour', hour,
        'total', total_posts,
        'successful', successful_posts,
        'success_rate', 
        CASE WHEN total_posts > 0 
          THEN ROUND((successful_posts::numeric / total_posts::numeric) * 100, 2)
          ELSE 0 
        END
      ) ORDER BY hour
    ) FROM hourly_stats) as hourly_distribution,
    
    (SELECT jsonb_agg(
      jsonb_build_object(
        'day', day_name,
        'total', total_posts,
        'successful', successful_posts,
        'success_rate', 
        CASE WHEN total_posts > 0 
          THEN ROUND((successful_posts::numeric / total_posts::numeric) * 100, 2)
          ELSE 0 
        END
      ) ORDER BY day_of_week
    ) FROM daily_stats) as day_of_week_distribution,
    
    -- Return top 3 performing hours as optimal posting times
    (SELECT jsonb_agg(
      jsonb_build_object(
        'hour', hour,
        'success_rate', 
        CASE WHEN total_posts > 0 
          THEN ROUND((successful_posts::numeric / total_posts::numeric) * 100, 2)
          ELSE 0 
        END
      ) ORDER BY (successful_posts::numeric / NULLIF(total_posts, 0)::numeric) DESC
    ) FROM (SELECT * FROM hourly_stats WHERE total_posts >= 3 LIMIT 3) top_hours) as optimal_posting_times;
END;
$$;