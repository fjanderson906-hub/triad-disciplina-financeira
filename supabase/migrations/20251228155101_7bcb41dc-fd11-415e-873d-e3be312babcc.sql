
-- Remover views com SECURITY DEFINER (padrão problemático)
DROP VIEW IF EXISTS public.base_projecao;
DROP VIEW IF EXISTS public.valores_recorrentes;

-- Criar função segura para valores recorrentes
CREATE OR REPLACE FUNCTION public.get_valores_recorrentes(p_user_id UUID)
RETURNS TABLE(valor NUMERIC, ocorrencias BIGINT)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    e.valor,
    COUNT(*) as ocorrencias
  FROM public.entries e
  WHERE e.tipo = 'guardar' AND e.user_id = p_user_id
  GROUP BY e.valor
  HAVING COUNT(*) >= 3
  ORDER BY ocorrencias DESC;
$$;

-- Criar função segura para base de projeção
CREATE OR REPLACE FUNCTION public.get_base_projecao(p_user_id UUID)
RETURNS TABLE(
  goal_id UUID,
  goal_name TEXT,
  meta_valor NUMERIC,
  valor_atual NUMERIC,
  valor_recorrente NUMERIC,
  ocorrencias BIGINT,
  meses_estimados NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
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
    FROM public.get_valores_recorrentes(p_user_id) 
    ORDER BY ocorrencias DESC 
    LIMIT 1
  ) vr ON TRUE
  WHERE g.status = 'in_progress' AND g.user_id = p_user_id;
$$;
