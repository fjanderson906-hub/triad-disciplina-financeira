
-- Criar enum para tipo de entrada
CREATE TYPE public.entry_type AS ENUM ('guardar', 'disponivel');

-- Criar tabela entries para registros financeiros
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  tipo entry_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo is_pro na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- Habilitar RLS na tabela entries
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para entries
CREATE POLICY "Users can view their own entries"
ON public.entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
ON public.entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
ON public.entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
ON public.entries FOR DELETE
USING (auth.uid() = user_id);

-- View: valores recorrentes (mesmo valor 3+ vezes do tipo 'guardar')
CREATE OR REPLACE VIEW public.valores_recorrentes AS
SELECT 
  user_id,
  valor,
  COUNT(*) as ocorrencias
FROM public.entries
WHERE tipo = 'guardar'
GROUP BY user_id, valor
HAVING COUNT(*) >= 3
ORDER BY ocorrencias DESC;

-- View: base para projeção (combina meta ativa com valor recorrente)
CREATE OR REPLACE VIEW public.base_projecao AS
SELECT 
  g.user_id,
  g.id as goal_id,
  g.goal_name,
  g.target_value as meta_valor,
  g.current_value as valor_atual,
  vr.valor as valor_recorrente,
  vr.ocorrencias,
  CASE 
    WHEN vr.valor > 0 THEN 
      CEIL((g.target_value - COALESCE(g.current_value, 0)) / vr.valor)
    ELSE NULL
  END as meses_estimados
FROM public.goals g
LEFT JOIN LATERAL (
  SELECT valor, ocorrencias 
  FROM public.valores_recorrentes 
  WHERE user_id = g.user_id 
  ORDER BY ocorrencias DESC 
  LIMIT 1
) vr ON TRUE
WHERE g.status = 'in_progress';

-- Função para verificar se usuário é Pro
CREATE OR REPLACE FUNCTION public.is_user_pro(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_pro, FALSE)
  FROM public.profiles
  WHERE id = p_user_id;
$$;
