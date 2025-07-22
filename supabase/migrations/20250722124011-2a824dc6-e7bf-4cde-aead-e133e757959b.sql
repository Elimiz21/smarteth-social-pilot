-- Create app_secrets table for storing application secrets
CREATE TABLE public.app_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Only owners can read/write secrets
CREATE POLICY "Only owners can manage secrets" 
ON public.app_secrets 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_secrets_updated_at
BEFORE UPDATE ON public.app_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();