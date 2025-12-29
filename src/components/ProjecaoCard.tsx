import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePlan } from "@/hooks/usePlan";
import { PaywallDialog } from "@/components/PaywallDialog";
import { ProPhrase } from "@/components/ProPhrase";
interface Entry {
  id: string;
  amount: number;
  timestamp: number;
}

interface Goal {
  name: string;
  targetAmount: number;
}

interface ProjecaoCardProps {
  entries: Entry[];
  savingRatio: number;
}

export const ProjecaoCard = ({ entries, savingRatio }: ProjecaoCardProps) => {
  const navigate = useNavigate();
  const { features, isLoading } = usePlan();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    // Load goal from localStorage
    const savedGoal = localStorage.getItem("triad-goal");
    if (savedGoal) {
      setGoal(JSON.parse(savedGoal));
    }
  }, []);

  useEffect(() => {
    if (!goal || entries.length < 3 || goal.targetAmount <= 0) {
      setEstimatedTime(null);
      return;
    }

    const totalReceived = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalSaved = totalReceived / savingRatio;
    const remaining = Math.max(goal.targetAmount - totalSaved, 0);

    if (remaining <= 0) {
      setEstimatedTime("Meta alcançada");
      return;
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
      referenceAmount = savedAmounts.reduce((a, b) => a + b, 0) / savedAmounts.length;
    }

    if (referenceAmount <= 0) {
      setEstimatedTime(null);
      return;
    }

    // Calculate months needed
    const monthsNeeded = Math.ceil(remaining / referenceAmount);

    // Format time estimation
    if (monthsNeeded < 1) {
      setEstimatedTime("< 1 mês");
    } else if (monthsNeeded === 1) {
      setEstimatedTime("~1 mês");
    } else if (monthsNeeded < 12) {
      setEstimatedTime(`~${monthsNeeded} meses`);
    } else {
      const years = Math.floor(monthsNeeded / 12);
      const months = monthsNeeded % 12;
      if (months === 0) {
        setEstimatedTime(`~${years} ${years === 1 ? 'ano' : 'anos'}`);
      } else {
        setEstimatedTime(`~${years}a ${months}m`);
      }
    }
  }, [entries, savingRatio, goal]);

  const hasGoal = goal && goal.targetAmount > 0;
  const hasEnoughData = entries.length >= 3;
  const canViewProjection = features.canViewProjection;

  const handleClick = () => {
    if (!canViewProjection && hasGoal && hasEnoughData && estimatedTime) {
      // Show paywall when user tries to view projection
      setShowPaywall(true);
    } else {
      navigate("/meta");
    }
  };

  // For free users, show locked state when there's data to show
  const isLocked = !canViewProjection && hasGoal && hasEnoughData && estimatedTime;

  return (
    <>
      <Card 
        className="bg-card border-border p-6 transition-smooth hover:shadow-gold cursor-pointer group"
        onClick={handleClick}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">
              Projeção
            </p>
            {isLocked ? (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  PRO
                </p>
              </div>
            ) : estimatedTime ? (
              <p className="text-2xl font-semibold text-foreground group-hover:text-gold transition-colors">
                {estimatedTime}
              </p>
            ) : (
              <p className="text-lg text-muted-foreground">
                {!hasGoal ? "Sem meta" : !hasEnoughData ? "Dados insuficientes" : "—"}
              </p>
            )}
          </div>
          <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
        </div>
        {canViewProjection && estimatedTime && !isLocked ? (
          <ProPhrase category="projecao" className="mt-3" />
        ) : (
          <p className="text-xs text-muted-foreground mt-3">
            {isLocked ? "Desbloqueie para ver" : hasGoal && goal?.name ? goal.name : "Tempo até o alvo"}
          </p>
        )}
      </Card>

      <PaywallDialog 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        trigger="projection"
      />
    </>
  );
};
