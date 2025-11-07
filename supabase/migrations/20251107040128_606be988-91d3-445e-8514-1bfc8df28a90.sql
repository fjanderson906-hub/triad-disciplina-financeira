-- Add saving_ratio column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS saving_ratio numeric DEFAULT 3 CHECK (saving_ratio IN (3, 10));

COMMENT ON COLUMN public.profiles.saving_ratio IS 'Proportion denominator for savings calculation (3 for 1/3, 10 for 1/10)';