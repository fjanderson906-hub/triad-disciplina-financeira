import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const Vault = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem("triad-entries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const totalReceived = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalSaved = totalReceived / 3;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    const exportData = entries.map((entry) => ({
      data: formatDate(entry.timestamp),
      recebido: formatCurrency(entry.amount),
      guardado: formatCurrency(entry.amount / 3),
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Data,Recebido,Guardado (1/3)\n" +
      exportData
        .map((row) => `${row.data},${row.recebido},${row.guardado}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `triad-vault-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Histórico exportado",
      description: "Arquivo CSV baixado com sucesso.",
    });
  };

  const handleReset = () => {
    setEntries([]);
    localStorage.removeItem("triad-entries");
    toast({
      title: "Cofre resetado",
      description: "Todos os dados foram removidos.",
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
              VAULT
            </h1>
            <p className="font-body text-sm md:text-base text-muted-foreground tracking-wide">
              Seu futuro, protegido.
            </p>
          </div>
        </header>

        {/* Total Saved Card */}
        <Card className="bg-card border-gold/30 p-8 transition-smooth hover:shadow-gold">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-gold" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total Guardado (1/3)
              </p>
              <p className="text-4xl md:text-5xl font-bold text-gold">
                {formatCurrency(totalSaved)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              De {formatCurrency(totalReceived)} recebidos
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExport}
            disabled={entries.length === 0}
            className="flex-1 bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-smooth"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Histórico
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={entries.length === 0}
                variant="outline"
                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar Cofre
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-foreground">
                  Resetar Cofre
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Tem certeza que deseja apagar todo o histórico do cofre? Esta
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

        {/* History */}
        {entries.length > 0 ? (
          <Card className="bg-card border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-4">
              Histórico Completo
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg bg-secondary/50 border border-border transition-smooth hover:bg-secondary space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-body">
                      {formatDate(entry.timestamp)}
                    </span>
                    <span className="text-sm font-semibold text-gold">
                      +{formatCurrency(entry.amount / 3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Recebido: {formatCurrency(entry.amount)}</span>
                    <span>Guardado: 1/3</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="bg-card border-border p-12">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl text-foreground">
                Cofre Vazio
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Adicione suas primeiras entradas para começar a construir seu
                futuro.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gold text-primary-foreground hover:bg-gold/90 transition-smooth mt-4"
              >
                Adicionar Entrada
              </Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
};

export default Vault;
