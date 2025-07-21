-- Create table for scheduled posts
CREATE TABLE public.scheduled_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    platforms TEXT[] NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'published', 'failed', 'cancelled')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for tracking individual platform executions
CREATE TABLE public.post_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    scheduled_post_id UUID NOT NULL REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'retrying')),
    external_post_id TEXT, -- ID from the social media platform
    external_url TEXT, -- URL to the published post
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    response_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for API credentials (encrypted)
CREATE TABLE public.social_media_credentials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    platform TEXT NOT NULL,
    credentials JSONB NOT NULL, -- Store encrypted API keys/tokens
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, platform)
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_posts
CREATE POLICY "Users can manage their own scheduled posts" 
    ON public.scheduled_posts 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Create policies for post_executions
CREATE POLICY "Users can view their own post executions" 
    ON public.post_executions 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.scheduled_posts 
            WHERE id = scheduled_post_id AND user_id = auth.uid()
        )
    );

-- Create policies for social_media_credentials
CREATE POLICY "Users can manage their own credentials" 
    ON public.social_media_credentials 
    FOR ALL 
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_scheduled_time ON public.scheduled_posts(scheduled_time);
CREATE INDEX idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX idx_post_executions_scheduled_post_id ON public.post_executions(scheduled_post_id);
CREATE INDEX idx_post_executions_platform ON public.post_executions(platform);
CREATE INDEX idx_social_media_credentials_user_id ON public.social_media_credentials(user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_scheduled_posts_updated_at
    BEFORE UPDATE ON public.scheduled_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_executions_updated_at
    BEFORE UPDATE ON public.post_executions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_media_credentials_updated_at
    BEFORE UPDATE ON public.social_media_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create execution records when a post is scheduled
CREATE OR REPLACE FUNCTION public.create_post_executions()
RETURNS TRIGGER AS $$
BEGIN
    -- Create execution records for each platform
    INSERT INTO public.post_executions (scheduled_post_id, platform)
    SELECT NEW.id, unnest(NEW.platforms);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create execution records
CREATE TRIGGER create_post_executions_trigger
    AFTER INSERT ON public.scheduled_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.create_post_executions();

-- Function to check for posts ready to be published
CREATE OR REPLACE FUNCTION public.get_posts_ready_for_publishing()
RETURNS SETOF public.scheduled_posts AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.scheduled_posts
    WHERE status = 'scheduled'
    AND scheduled_time <= now()
    AND retry_count < max_retries;
END;
$$ LANGUAGE plpgsql;

-- Function to update post status and handle retries
CREATE OR REPLACE FUNCTION public.update_post_execution_status(
    p_execution_id UUID,
    p_status TEXT,
    p_external_post_id TEXT DEFAULT NULL,
    p_external_url TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_response_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_scheduled_post_id UUID;
    v_all_completed BOOLEAN;
    v_any_failed BOOLEAN;
BEGIN
    -- Update the execution record
    UPDATE public.post_executions SET
        status = p_status,
        external_post_id = p_external_post_id,
        external_url = p_external_url,
        error_message = p_error_message,
        response_data = COALESCE(p_response_data, response_data),
        executed_at = CASE WHEN p_status IN ('success', 'failed') THEN now() ELSE executed_at END,
        retry_count = CASE WHEN p_status = 'retrying' THEN retry_count + 1 ELSE retry_count END
    WHERE id = p_execution_id
    RETURNING scheduled_post_id INTO v_scheduled_post_id;

    -- Check if all executions for this post are completed
    SELECT 
        NOT EXISTS (SELECT 1 FROM public.post_executions WHERE scheduled_post_id = v_scheduled_post_id AND status IN ('pending', 'processing', 'retrying')),
        EXISTS (SELECT 1 FROM public.post_executions WHERE scheduled_post_id = v_scheduled_post_id AND status = 'failed')
    INTO v_all_completed, v_any_failed;

    -- Update the main post status
    IF v_all_completed THEN
        UPDATE public.scheduled_posts SET
            status = CASE WHEN v_any_failed THEN 'failed' ELSE 'published' END,
            published_at = CASE WHEN NOT v_any_failed THEN now() ELSE published_at END
        WHERE id = v_scheduled_post_id;
    END IF;
END;
$$ LANGUAGE plpgsql;