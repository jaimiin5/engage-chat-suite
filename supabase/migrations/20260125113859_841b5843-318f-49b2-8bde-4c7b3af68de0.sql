-- Add ai_enabled column to organization_settings
ALTER TABLE public.organization_settings 
ADD COLUMN ai_enabled boolean NOT NULL DEFAULT false;