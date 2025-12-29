import { useState } from "react";
import { Crown, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PRICES, PlanInterval } from "@/lib/stripe-config";
import { toast } from "sonner";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: "projection" | "pattern" | "multiple_goals" | "history" | "ritmo" | "decision";
}

const FEATURE_LIST = [
  "Projeção automática de tempo para metas",
  "Detecção de padrão recorrente",
  "Metas múltiplas",
  "Histórico completo",
  "Indicador de constância (Ritmo)",
  "Acesso completo ao cofre",
];

export const PaywallDialog = ({ 
  open, 
  onOpenChange,
  trigger 
}: PaywallDialogProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanInterval>("anual");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Faça login para continuar");
        setIsLoading(false);
        return;
      }

      const priceId = STRIPE_PRICES[selectedPlan].priceId;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Erro ao iniciar pagamento");
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-gold" />
            </div>
          </div>
          
          <DialogTitle className="font-display text-2xl text-center text-foreground">
            TRIAD PRO
          </DialogTitle>
          
          <DialogDescription className="text-center text-muted-foreground text-base">
            Você já criou constância. Agora falta clareza.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Features List */}
          <div className="space-y-3">
            {FEATURE_LIST.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-gold" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="border-t border-border pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPlan("mensal")}
                className={`rounded-lg p-4 text-center space-y-1 border transition-all ${
                  selectedPlan === "mensal"
                    ? "bg-secondary border-gold/50"
                    : "bg-secondary/50 border-border hover:border-border/80"
                }`}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mensal</p>
                <p className="text-xl font-bold text-foreground">R$ 29</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </button>
              <button
                onClick={() => setSelectedPlan("anual")}
                className={`rounded-lg p-4 text-center space-y-1 border relative transition-all ${
                  selectedPlan === "anual"
                    ? "bg-gold/10 border-gold/50"
                    : "bg-gold/5 border-gold/30 hover:border-gold/40"
                }`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  Economia
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Anual</p>
                <p className="text-xl font-bold text-gold">R$ 197</p>
                <p className="text-xs text-muted-foreground">/ano</p>
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gold text-primary-foreground hover:bg-gold/90 transition-smooth h-12"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              Assinar TRIAD PRO
            </Button>
            <Button 
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Continuar grátis
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center text-muted-foreground">
            O app não promete ganhos financeiros. Apenas transforma constância em previsibilidade.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
