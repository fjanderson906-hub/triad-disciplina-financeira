import { useEffect, useState } from "react";
import { Clock, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePlan } from "@/hooks/usePlan";
import { PaywallDialog } from "@/components/PaywallDialog";
import { ProPhrase } from "@/components/ProPhrase";
interface Entry {
  id: string;
  amount: number;
  timestamp: number;
}

interface RitmoCardProps {
  entries: Entry[];
  savingRatio: number;
}

export const RitmoCard = ({ entries, savingRatio }: RitmoCardProps) => {
  const { features } = usePlan();
  const [streak, setStreak] = useState<{ days: number; weeks: number } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (entries.length === 0) {
      setStreak(null);
      return;
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    
    // Get the first entry date to calculate streak from
    const firstEntryDate = new Date(sortedEntries[sortedEntries.length - 1].timestamp);
    const lastEntryDate = new Date(sortedEntries[0].timestamp);
    
    // Calculate days since first entry
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - firstEntryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate weeks
    const weeks = Math.floor(diffDays / 7);
    
    setStreak({ days: diffDays, weeks });
  }, [entries, savingRatio]);

  const canViewRitmo = features.canViewRitmo;
  const hasData = streak && entries.length > 0;
  const isLocked = !canViewRitmo && hasData;

  const handleClick = () => {
    if (isLocked) {
      setShowPaywall(true);
    }
  };

  if (!streak || entries.length === 0) {
    return (
      <Card className="bg-card border-border p-6 transition-smooth">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Ritmo
            </p>
            <p className="text-lg text-muted-foreground">
              Sem dados
            </p>
          </div>
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Comece a registrar
        </p>
      </Card>
    );
  }

  const displayText = streak.weeks >= 1 
    ? `${streak.weeks} ${streak.weeks === 1 ? 'semana' : 'semanas'}` 
    : `${streak.days} ${streak.days === 1 ? 'dia' : 'dias'}`;

  return (
    <>
      <Card 
        className={`bg-card border-border p-6 transition-smooth ${isLocked ? 'cursor-pointer' : ''} hover:shadow-gold`}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Ritmo
            </p>
            {isLocked ? (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  PRO
                </p>
              </div>
            ) : (
              <p className="text-2xl font-semibold text-foreground">
                {displayText}
              </p>
            )}
          </div>
          <Clock className={`w-5 h-5 ${isLocked ? 'text-muted-foreground' : 'text-gold'}`} />
        </div>
        {canViewRitmo && !isLocked ? (
          <ProPhrase category="ritmo" className="mt-3" />
        ) : (
          <p className="text-xs text-muted-foreground mt-3">
            {isLocked ? "Desbloqueie para ver" : "Constância ativa"}
          </p>
        )}
      </Card>

      <PaywallDialog 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        trigger="ritmo"
      />
    </>
  );
};
