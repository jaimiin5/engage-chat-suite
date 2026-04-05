ALTER TABLE public.chatbots
ADD COLUMN primary_color text DEFAULT '#000000',
ADD COLUMN icon_type text DEFAULT 'icon',
ADD COLUMN icon_text text DEFAULT NULL;