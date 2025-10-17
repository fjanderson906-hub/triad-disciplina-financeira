import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RotateCcw, TrendingUp, Wallet, Lock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Entry {
  id: string;
  amount: number;
  timestamp: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  // Load entries from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("triad-entries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    
    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (entries.length > 0 || localStorage.getItem("triad-entries")) {
      localStorage.setItem("triad-entries", JSON.stringify(entries));
    }
  }, [entries]);

  const totalReceived = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const toSave = totalReceived / 3;
  const available = totalReceived - toSave;

  const handleAddEntry = () => {
    const amount = parseFloat(inputValue.replace(",", "."));
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor numérico positivo.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: Entry = {
      id: Date.now().toString(),
      amount,
      timestamp: Date.now(),
    };

    setEntries([newEntry, ...entries]);
    setInputValue("");
    
    toast({
      title: "Entrada adicionada",
      description: `R$ ${amount.toFixed(2)} registrado com sucesso.`,
    });
  };

  const handleReset = () => {
    setEntries([]);
    localStorage.removeItem("triad-entries");
    toast({
      title: "Dados resetados",
      description: "Todas as entradas foram removidas.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-charcoal">
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="font-display text-7xl md:text-8xl font-bold tracking-wider text-gold">
            TRIAD
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground tracking-wide">
            Controle. Ordem. Liberdade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-charcoal p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-3 py-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold tracking-wider text-gold">
            TRIAD
          </h1>
          <p className="font-body text-sm md:text-base text-muted-foreground tracking-wide">
            Controle. Ordem. Liberdade.
          </p>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border p-6 transition-smooth hover:shadow-gold">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Total Recebido
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(totalReceived)}
                </p>
              </div>
              <Wallet className="w-5 h-5 text-gold" />
            </div>
          </Card>

          <Card 
            className="bg-card border-gold/30 p-6 transition-smooth hover:shadow-gold cursor-pointer"
            onClick={() => navigate("/vault")}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Guardar (1/3)
                </p>
                <p className="text-2xl font-semibold text-gold">
                  {formatCurrency(toSave)}
                </p>
              </div>
              <Lock className="w-5 h-5 text-gold" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Clique para ver o cofre
            </p>
          </Card>

          <Card className="bg-card border-border p-6 transition-smooth hover:shadow-gold">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Disponível (2/3)
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(available)}
                </p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-foreground" />
            </div>
          </Card>

          <Card 
            className="bg-card border-border p-6 transition-smooth hover:shadow-gold cursor-pointer group"
            onClick={() => navigate("/meta")}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground group-hover:text-gold transition-colors">
                  Meta
                </p>
                <p className="text-2xl font-semibold text-foreground group-hover:text-gold transition-colors">
                  Definir
                </p>
              </div>
              <Target className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Planeje seu objetivo
            </p>
          </Card>
        </section>

        {/* Input Section */}
        <Card className="bg-card border-border p-6">
          <div className="space-y-4">
            <h2 className="font-display text-xl text-foreground">
              Adicionar Entrada
            </h2>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="0,00"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground font-body text-lg"
              />
              <Button
                onClick={handleAddEntry}
                className="bg-gold text-primary-foreground hover:bg-gold/90 transition-smooth"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </Card>

        {/* Entries List */}
        {entries.length > 0 && (
          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground">
                Entradas Recentes
              </h2>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-foreground">
                      Confirmar Reset
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Tem certeza que deseja remover todas as entradas? Esta
                      ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary border-border text-secondary-foreground">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Resetar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border transition-smooth hover:bg-secondary"
                >
                  <span className="text-sm text-muted-foreground font-body">
                    {formatDate(entry.timestamp)}
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Visual Ratio */}
        {totalReceived > 0 && (
          <Card className="bg-card border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-4">
              Proporção
            </h2>
            <div className="h-12 flex rounded-lg overflow-hidden border border-border">
              <div
                className="bg-gold transition-all duration-700 ease-out flex items-center justify-center"
                style={{ width: "33.33%" }}
              >
                <span className="text-xs font-semibold text-primary-foreground">
                  1/3
                </span>
              </div>
              <div
                className="bg-muted transition-all duration-700 ease-out flex items-center justify-center"
                style={{ width: "66.67%" }}
              >
                <span className="text-xs font-semibold text-foreground">
                  2/3
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
};

export default Index;
