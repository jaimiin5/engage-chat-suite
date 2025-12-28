-- Create custom Q&A pairs table for predefined responses
CREATE TABLE public.chatbot_qa_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  match_type TEXT NOT NULL DEFAULT 'contains' CHECK (match_type IN ('exact', 'contains', 'starts_with')),
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_qa_pairs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can view Q&A pairs" 
ON public.chatbot_qa_pairs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chatbots c
    WHERE c.id = chatbot_id AND is_org_member(auth.uid(), c.organization_id)
  )
);

CREATE POLICY "Members can create Q&A pairs" 
ON public.chatbot_qa_pairs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chatbots c
    WHERE c.id = chatbot_id AND is_org_member(auth.uid(), c.organization_id)
  )
);

CREATE POLICY "Members can update Q&A pairs" 
ON public.chatbot_qa_pairs 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.chatbots c
    WHERE c.id = chatbot_id AND is_org_member(auth.uid(), c.organization_id)
  )
);

CREATE POLICY "Members can delete Q&A pairs" 
ON public.chatbot_qa_pairs 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.chatbots c
    WHERE c.id = chatbot_id AND is_org_member(auth.uid(), c.organization_id)
  )
);

-- Allow public access for widget to read Q&A pairs
CREATE POLICY "Public can view active Q&A pairs" 
ON public.chatbot_qa_pairs 
FOR SELECT 
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_chatbot_qa_pairs_updated_at
BEFORE UPDATE ON public.chatbot_qa_pairs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();