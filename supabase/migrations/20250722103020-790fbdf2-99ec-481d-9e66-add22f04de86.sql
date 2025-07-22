-- Allow users to insert post executions for their own scheduled posts
CREATE POLICY "Users can create post executions for their own posts" 
ON public.post_executions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM scheduled_posts 
  WHERE scheduled_posts.id = post_executions.scheduled_post_id 
  AND scheduled_posts.user_id = auth.uid()
));

-- Allow users to update post executions for their own scheduled posts
CREATE POLICY "Users can update post executions for their own posts" 
ON public.post_executions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM scheduled_posts 
  WHERE scheduled_posts.id = post_executions.scheduled_post_id 
  AND scheduled_posts.user_id = auth.uid()
));