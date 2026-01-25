-- Create table for storing crawled website content
CREATE TABLE public.chatbot_website_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id uuid NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    website_url text NOT NULL,
    content text NOT NULL,
    title text,
    crawled_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(chatbot_id) -- One website per chatbot
);

-- Enable RLS
ALTER TABLE public.chatbot_website_content ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Members can view website content" 
ON public.chatbot_website_content 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM chatbots c 
        WHERE c.id = chatbot_website_content.chatbot_id 
        AND is_org_member(auth.uid(), c.organization_id)
    )
);

CREATE POLICY "Members can create website content" 
ON public.chatbot_website_content 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM chatbots c 
        WHERE c.id = chatbot_website_content.chatbot_id 
        AND is_org_member(auth.uid(), c.organization_id)
    )
);

CREATE POLICY "Members can update website content" 
ON public.chatbot_website_content 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM chatbots c 
        WHERE c.id = chatbot_website_content.chatbot_id 
        AND is_org_member(auth.uid(), c.organization_id)
    )
);

CREATE POLICY "Members can delete website content" 
ON public.chatbot_website_content 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM chatbots c 
        WHERE c.id = chatbot_website_content.chatbot_id 
        AND is_org_member(auth.uid(), c.organization_id)
    )
);

-- Public access for chat function (service role will use this)
CREATE POLICY "Public can view website content for active chatbots" 
ON public.chatbot_website_content 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM chatbots c 
        WHERE c.id = chatbot_website_content.chatbot_id 
        AND c.is_active = true
    )
);

-- Add website_url column to chatbots table
ALTER TABLE public.chatbots ADD COLUMN website_url text;

-- Trigger for updated_at
CREATE TRIGGER update_chatbot_website_content_updated_at
    BEFORE UPDATE ON public.chatbot_website_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();