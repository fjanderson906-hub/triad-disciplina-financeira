import { useState } from "react";
import { AlertTriangle, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface DecisaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (decision: "estrategia" | "emergencia") => void;
}

export const DecisaoDialog = ({ open, onOpenChange, onConfirm }: DecisaoDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleDecision = (decision: "estrategia" | "emergencia" | "emocao") => {
    if (decision === "emocao") {
      toast({
        title: "Acesso bloqueado",
        description: "Decisões emocionais não são permitidas no cofre.",
        variant: "destructive",
      });
      setSelectedOption(null);
      onOpenChange(false);
      return;
    }

    // Record the decision
    const decisions = JSON.parse(localStorage.getItem("triad-decisions") || "[]");
    decisions.push({
      type: decision,
      timestamp: Date.now(),
    });
    localStorage.setItem("triad-decisions", JSON.stringify(decisions));

    setSelectedOption(null);
    onConfirm(decision);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader className="space-y-4">
          <DialogTitle className="font-display text-2xl text-center text-foreground">
            Isso é estratégia ou emoção?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Antes de acessar o cofre, avalie sua decisão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-start gap-4 border-border hover:border-gold hover:bg-gold/5 transition-smooth"
            onClick={() => handleDecision("estrategia")}
          >
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Estratégia</p>
              <p className="text-xs text-muted-foreground">Decisão planejada e racional</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-start gap-4 border-border hover:border-gold hover:bg-gold/5 transition-smooth"
            onClick={() => handleDecision("emergencia")}
          >
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-gold" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Emergência real</p>
              <p className="text-xs text-muted-foreground">Situação imprevista e urgente</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center justify-start gap-4 border-destructive/30 hover:border-destructive hover:bg-destructive/5 transition-smooth"
            onClick={() => handleDecision("emocao")}
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Emoção</p>
              <p className="text-xs text-muted-foreground">Ação bloqueada</p>
            </div>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border mt-4">
          O sistema não motiva. Ele reflete o comportamento.
        </p>
      </DialogContent>
    </Dialog>
  );
};
