import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  const [streak, setStreak] = useState<{ days: number; weeks: number } | null>(null);

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
    
    // For discipline tracking, we consider the streak as continuous if:
    // - User has been consistently adding entries
    // - We use the time from first entry to now as the "active period"
    
    // Calculate weeks
    const weeks = Math.floor(diffDays / 7);
    
    setStreak({ days: diffDays, weeks });
  }, [entries, savingRatio]);

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
    <Card className="bg-card border-border p-6 transition-smooth hover:shadow-gold">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Ritmo
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {displayText}
          </p>
        </div>
        <Clock className="w-5 h-5 text-gold" />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Constância ativa
      </p>
    </Card>
  );
};
