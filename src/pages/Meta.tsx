import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, TrendingUp, Award, Clock, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { PaywallDialog } from "@/components/PaywallDialog";

interface Entry {
  id: string;
  amount: number;
  timestamp: number;
}

interface Goal {
  name: string;
  targetAmount: number;
}

const Meta = () => {
  const navigate = useNavigate();
  const { features, isPro } = usePlan();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goal, setGoal] = useState<Goal>({ name: "", targetAmount: 0 });
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [savingRatio, setSavingRatio] = useState<number>(3);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<"projection" | "pattern" | "multiple_goals">("projection");

  useEffect(() => {
    const loadData = async () => {
      // Load saving ratio from user profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("saving_ratio")
          .eq("id", user.id)
          .single();
        
        if (profile?.saving_ratio) {
          setSavingRatio(profile.saving_ratio);
        }
      }
    };

    loadData();

    const savedEntries = localStorage.getItem("triad-entries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    const savedGoal = localStorage.getItem("triad-goal");
    if (savedGoal) {
      const parsedGoal = JSON.parse(savedGoal);
      setGoal(parsedGoal);
      setGoalName(parsedGoal.name);
      setGoalAmount(parsedGoal.targetAmount.toString());
    }
  }, []);

  const totalReceived = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalSaved = totalReceived / savingRatio;

  const progress = goal.targetAmount > 0 ? Math.min((totalSaved / goal.targetAmount) * 100, 100) : 0;
  const remaining = Math.max(goal.targetAmount - totalSaved, 0);
  const goalAchieved = totalSaved >= goal.targetAmount && goal.targetAmount > 0;

  // Calculate estimated time based on saving pattern
  const calculateEstimatedTime = () => {
    if (entries.length < 3 || remaining <= 0) {
      return null;
    }

    // Get saved amounts based on current ratio
    const savedAmounts = entries.map(e => e.amount / savingRatio);

    // Count frequency of each amount
    const frequencyMap: Record<number, number> = {};
    savedAmounts.forEach(amount => {
      const roundedAmount = Math.round(amount * 100) / 100;
      frequencyMap[roundedAmount] = (frequencyMap[roundedAmount] || 0) + 1;
    });

    // Find the most frequent amount that appears 3+ times
    let referenceAmount = 0;
    let maxFrequency = 0;

    Object.entries(frequencyMap).forEach(([amount, frequency]) => {
      if (frequency >= 3 && frequency > maxFrequency) {
        referenceAmount = parseFloat(amount);
        maxFrequency = frequency;
      }
    });

    // If no pattern found with 3+ occurrences, use average
    if (referenceAmount === 0) {
      // Check if we have at least 3 entries to calculate average
      if (entries.length < 3) return null;
      referenceAmount = savedAmounts.reduce((a, b) => a + b, 0) / savedAmounts.length;
    }

    if (referenceAmount <= 0) return null;

    // Calculate months needed
    const monthsNeeded = Math.ceil(remaining / referenceAmount);

    // Format time estimation
    if (monthsNeeded < 1) {
      return "menos de 1 mês";
    } else if (monthsNeeded === 1) {
      return "1 mês";
    } else if (monthsNeeded < 12) {
      return `${monthsNeeded} meses`;
    } else {
      const years = Math.floor(monthsNeeded / 12);
      const months = monthsNeeded % 12;
      if (months === 0) {
        return years === 1 ? "1 ano" : `${years} anos`;
      }
      return years === 1 
        ? `1 ano e ${months} ${months === 1 ? 'mês' : 'meses'}`
        : `${years} anos e ${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
  };

  const estimatedTime = calculateEstimatedTime();
  const hasEnoughData = entries.length >= 3;
  const canViewProjection = features.canViewProjection;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSaveGoal = () => {
    const amount = parseFloat(goalAmount);
    
    if (!goalName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para sua meta.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para a meta.",
        variant: "destructive",
      });
      return;
    }

    const newGoal = {
      name: goalName.trim(),
      targetAmount: amount,
    };

    setGoal(newGoal);
    localStorage.setItem("triad-goal", JSON.stringify(newGoal));

    toast({
      title: "Meta definida",
      description: `Meta "${goalName}" de ${formatCurrency(amount)} salva com sucesso.`,
    });
  };

  const handleProjectionClick = () => {
    if (!canViewProjection && estimatedTime) {
      setPaywallTrigger("projection");
      setShowPaywall(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-charcoal p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="text-center space-y-3">
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-gold">
              META
            </h1>
            <p className="font-body text-sm md:text-base text-muted-foreground tracking-wide">
              Defina. Planeje. Conquiste.
            </p>
          </div>
        </header>

        {goalAchieved ? (
          /* Achievement Screen */
          <Card className="bg-card border-gold/30 p-12 text-center space-y-6 animate-scale-in">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
                <Award className="w-12 h-12 text-gold" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gold">
                Meta Alcançada
              </h2>
              <p className="text-lg text-foreground">
                Ordem. Disciplina. Resultado.
              </p>
              <p className="text-sm text-muted-foreground">
                {goal.name}
              </p>
              <p className="text-2xl font-bold text-gold">
                {formatCurrency(totalSaved)}
              </p>
            </div>
            <Button
              onClick={() => toast({
                title: "Em breve",
                description: "Funcionalidade de carteira de investimentos em desenvolvimento.",
              })}
              className="bg-gold text-primary-foreground hover:bg-gold/90 transition-smooth"
            >
              Criar Carteira de Investimentos
            </Button>
          </Card>
        ) : (
          <>
            {/* Goal Setup */}
            <Card className="bg-card border-border p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-xl text-foreground">
                  Definir Meta
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name" className="text-muted-foreground">
                    Nome da Meta
                  </Label>
                  <Input
                    id="goal-name"
                    type="text"
                    placeholder="Ex: Reserva de emergência"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-amount" className="text-muted-foreground">
                    Valor da Meta
                  </Label>
                  <Input
                    id="goal-amount"
                    type="number"
                    placeholder="Ex: 2000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>

                <Button
                  onClick={handleSaveGoal}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold/90 transition-smooth"
                >
                  Salvar Meta
                </Button>
              </div>
            </Card>

            {/* Progress Section */}
            {goal.targetAmount > 0 && (
              <Card className="bg-card border-gold/30 p-8 space-y-6 transition-smooth hover:shadow-gold">
                <div className="text-center space-y-2">
                  <h3 className="font-display text-2xl text-foreground">
                    {goal.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Meta: {formatCurrency(goal.targetAmount)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gold" />
                      <span className="text-sm text-muted-foreground">Progresso</span>
                    </div>
                    <span className="text-2xl font-bold text-gold">
                      {progress.toFixed(1)}%
                    </span>
                  </div>

                  <Progress 
                    value={progress} 
                    className="h-4 bg-secondary transition-all duration-500 ease-out"
                  />

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Guardado
                      </p>
                      <p className="text-lg font-bold text-gold">
                        {formatCurrency(totalSaved)}
                      </p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Falta
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Estimation Section */}
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold" />
                    <span className="text-sm font-medium text-foreground">Projeção de Tempo</span>
                    {!canViewProjection && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Crown className="w-3 h-3" />
                        PRO
                      </span>
                    )}
                  </div>

                  {canViewProjection ? (
                    // PRO users see full projection
                    estimatedTime ? (
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Mantendo esse ritmo, sua meta pode ser alcançada em aproximadamente:
                        </p>
                        <p className="text-2xl font-bold text-gold text-center py-2">
                          {estimatedTime}
                        </p>
                        <p className="text-xs text-muted-foreground italic text-center">
                          A projeção reflete constância, não promessa.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-secondary/30 rounded-lg p-4 space-y-3 opacity-70">
                        <p className="text-sm text-muted-foreground text-center">
                          {!hasEnoughData 
                            ? "Registre pelo menos 3 entradas para obter uma estimativa."
                            : "Não foi possível calcular uma estimativa com os dados atuais."}
                        </p>
                      </div>
                    )
                  ) : (
                    // Free users see locked state
                    <div 
                      className="bg-secondary/30 rounded-lg p-4 space-y-3 cursor-pointer hover:bg-secondary/50 transition-smooth"
                      onClick={handleProjectionClick}
                    >
                      <div className="flex flex-col items-center justify-center py-4 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          {hasEnoughData 
                            ? "Desbloqueie o TRIAD PRO para ver a projeção"
                            : "Registre pelo menos 3 entradas para obter uma estimativa."}
                        </p>
                        {hasEnoughData && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gold/30 text-gold hover:bg-gold/10"
                            onClick={handleProjectionClick}
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Ver projeção
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Observations - Only visible for PRO or when there's useful info */}
                  {canViewProjection && (
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider">Observações</span>
                      </div>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-gold mt-0.5">•</span>
                          <span>O cálculo considera apenas valores realmente guardados.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold mt-0.5">•</span>
                          <span>Se não houver padrão suficiente, a estimativa não será exibida.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold mt-0.5">•</span>
                          <span>Registre entradas com consistência para obter projeções mais precisas.</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      <PaywallDialog 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        trigger={paywallTrigger}
      />
    </main>
  );
};

export default Meta;
