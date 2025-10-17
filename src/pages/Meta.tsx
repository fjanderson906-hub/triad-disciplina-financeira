import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

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
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goal, setGoal] = useState<Goal>({ name: "", targetAmount: 0 });
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  useEffect(() => {
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
  const totalSaved = totalReceived / 3;

  const progress = goal.targetAmount > 0 ? Math.min((totalSaved / goal.targetAmount) * 100, 100) : 0;
  const remaining = Math.max(goal.targetAmount - totalSaved, 0);
  const goalAchieved = totalSaved >= goal.targetAmount && goal.targetAmount > 0;

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
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Meta;
