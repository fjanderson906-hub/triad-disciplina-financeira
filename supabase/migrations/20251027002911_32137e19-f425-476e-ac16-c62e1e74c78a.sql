-- Create enum for plan types
CREATE TYPE public.plan_type AS ENUM ('BASICO', 'OURO', 'DIAMANTE', 'SAFIRA');

-- Create enum for plan status
CREATE TYPE public.plan_status AS ENUM ('ativo', 'inativo', 'cancelado');

-- Create user_plans table
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name plan_type NOT NULL DEFAULT 'BASICO',
  plan_price NUMERIC NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  next_billing_date TIMESTAMP WITH TIME ZONE,
  status plan_status NOT NULL DEFAULT 'ativo',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_plans
CREATE POLICY "Users can view their own plan"
  ON public.user_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan"
  ON public.user_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan"
  ON public.user_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create default plan for new users
CREATE OR REPLACE FUNCTION public.create_default_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan_name, plan_price, status)
  VALUES (NEW.id, 'BASICO', 0, 'ativo');
  RETURN NEW;
END;
$$;

-- Trigger to create default plan when user signs up
CREATE TRIGGER on_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_plan();

-- Add trigger to update updated_at on user_plans
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to check if user should see upgrade prompt (3+ transactions)
CREATE OR REPLACE FUNCTION public.should_show_upgrade_prompt(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*) >= 3 AND
    (SELECT plan_name FROM public.user_plans WHERE user_id = p_user_id) = 'BASICO'
  FROM public.transactions
  WHERE user_id = p_user_id AND type = 'income';
$$;

-- Function to get user's current plan features
CREATE OR REPLACE FUNCTION public.get_plan_features(p_user_id UUID)
RETURNS TABLE(
  can_use_goals BOOLEAN,
  can_use_basic_ai BOOLEAN,
  can_use_limited_ai BOOLEAN,
  can_use_full_ai BOOLEAN,
  can_use_realtime_ai BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE 
      WHEN plan_name IN ('BASICO', 'OURO', 'DIAMANTE', 'SAFIRA') THEN TRUE
      ELSE FALSE
    END as can_use_goals,
    CASE 
      WHEN plan_name IN ('OURO', 'DIAMANTE', 'SAFIRA') THEN TRUE
      ELSE FALSE
    END as can_use_basic_ai,
    CASE 
      WHEN plan_name IN ('DIAMANTE', 'SAFIRA') THEN TRUE
      ELSE FALSE
    END as can_use_limited_ai,
    CASE 
      WHEN plan_name = 'SAFIRA' THEN TRUE
      ELSE FALSE
    END as can_use_full_ai,
    CASE 
      WHEN plan_name = 'SAFIRA' THEN TRUE
      ELSE FALSE
    END as can_use_realtime_ai
  FROM public.user_plans
  WHERE user_id = p_user_id AND status = 'ativo';
$$;