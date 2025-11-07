import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { SubliminalMessage } from "@/components/SubliminalMessage";

interface FII {
  id: string;
  name: string;
  amount: number;
  valorization: number;
  dividends: number;
}

interface Stock {
  id: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  change24h: number;
}

interface JourneyData {
  startDate: string;
  reserve: number;
  fiis: FII[];
  stocks: Stock[];
  cryptos: Crypto[];
}

const Journey = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<JourneyData>({
    startDate: new Date().toISOString().split("T")[0],
    reserve: 0,
    fiis: [],
    stocks: [],
    cryptos: [],
  });

  const [newReserve, setNewReserve] = useState("");
  const [showFIIForm, setShowFIIForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showCryptoForm, setShowCryptoForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("triad-journey");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  const saveData = (newData: JourneyData) => {
    setData(newData);
    localStorage.setItem("triad-journey", JSON.stringify(newData));
  };

  const handleSaveReserve = () => {
    const value = parseFloat(newReserve);
    if (!isNaN(value) && value >= 0) {
      saveData({ ...data, reserve: value });
      toast({ description: "Reserva atualizada com sucesso" });
      setNewReserve("");
    }
  };

  const addFII = () => {
    const newFII: FII = {
      id: Date.now().toString(),
      name: "Novo FII",
      amount: 0,
      valorization: 0,
      dividends: 0,
    };
    saveData({ ...data, fiis: [...data.fiis, newFII] });
    setShowFIIForm(false);
  };

  const addStock = () => {
    const newStock: Stock = {
      id: Date.now().toString(),
      ticker: "PETR4",
      quantity: 0,
      avgPrice: 0,
      currentPrice: 0,
    };
    saveData({ ...data, stocks: [...data.stocks, newStock] });
    setShowStockForm(false);
  };

  const addCrypto = () => {
    const newCrypto: Crypto = {
      id: Date.now().toString(),
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0,
      currentPrice: 0,
      change24h: 0,
    };
    saveData({ ...data, cryptos: [...data.cryptos, newCrypto] });
    setShowCryptoForm(false);
  };

  const removeFII = (id: string) => {
    saveData({ ...data, fiis: data.fiis.filter((f) => f.id !== id) });
  };

  const removeStock = (id: string) => {
    saveData({ ...data, stocks: data.stocks.filter((s) => s.id !== id) });
  };

  const removeCrypto = (id: string) => {
    saveData({ ...data, cryptos: data.cryptos.filter((c) => c.id !== id) });
  };

  const calculateTotals = () => {
    const reserveTotal = data.reserve;
    const fiisTotal = data.fiis.reduce((sum, fii) => sum + fii.amount, 0);
    const stocksTotal = data.stocks.reduce(
      (sum, stock) => sum + stock.quantity * stock.currentPrice,
      0
    );
    const cryptosTotal = data.cryptos.reduce(
      (sum, crypto) => sum + crypto.amount * crypto.currentPrice,
      0
    );

    const total = reserveTotal + fiisTotal + stocksTotal + cryptosTotal;

    return {
      reserve: reserveTotal,
      fiis: fiisTotal,
      stocks: stocksTotal,
      cryptos: cryptosTotal,
      total,
    };
  };

  const totals = calculateTotals();

  const pieData = [
    { name: "Reserva", value: totals.reserve, color: "hsl(var(--gold))" },
    { name: "FIIs", value: totals.fiis, color: "hsl(var(--accent))" },
    { name: "Ações", value: totals.stocks, color: "hsl(var(--primary))" },
    { name: "Cripto", value: totals.cryptos, color: "hsl(var(--muted))" },
  ].filter((item) => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const getAnalysis = () => {
    const warnings = [];
    
    if (totals.total === 0) return [];

    const cryptoPercent = (totals.cryptos / totals.total) * 100;
    const fiisPercent = (totals.fiis / totals.total) * 100;
    const reservePercent = (totals.reserve / totals.total) * 100;

    if (cryptoPercent > 60) {
      warnings.push({
        type: "warning",
        message: "Cripto acima de 60% — risco elevado para perfil conservador.",
      });
    }

    if (fiisPercent < 20 && totals.total > 1000) {
      warnings.push({
        type: "info",
        message: "FIIs abaixo de 20% — boa oportunidade de diversificar.",
      });
    }

    if (reservePercent < 10 && totals.total > 5000) {
      warnings.push({
        type: "warning",
        message: "Reserva abaixo de 10% — considere aumentar sua segurança financeira.",
      });
    }

    if (data.reserve > 0 && data.reserve < 500) {
      warnings.push({
        type: "info",
        message: "Reserva estagnada — reinvista parte para rendimento.",
      });
    }

    return warnings;
  };

  const analysis = getAnalysis();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      <SubliminalMessage position="bottom" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-display text-gold tracking-wider">
            MINHA JORNADA
          </h1>
          <p className="text-muted-foreground text-sm tracking-widest">
            Ordem. Crescimento. Domínio.
          </p>
        </div>

        {/* Day 1 */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-gold text-sm tracking-widest">DAY 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Início: <span className="text-gold">{formatDate(data.startDate)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Reserva */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-gold text-sm tracking-widest">💰 RESERVA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="reserve" className="text-muted-foreground text-xs">
                  Valor da Reserva
                </Label>
                <Input
                  id="reserve"
                  type="number"
                  value={newReserve}
                  onChange={(e) => setNewReserve(e.target.value)}
                  placeholder="0.00"
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={handleSaveReserve} className="self-end bg-gold hover:bg-gold/90 text-primary-foreground">
                Salvar
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data.reserve)}
              </p>
              <p className="text-sm text-muted-foreground">
                {totals.total > 0
                  ? `${((data.reserve / totals.total) * 100).toFixed(1)}% do total`
                  : "0% do total"}
              </p>
              <p className="text-xs text-gold">Rendimento estimado: +0,68%/mês</p>
            </div>
          </CardContent>
        </Card>

        {/* FIIs */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gold text-sm tracking-widest">🏢 FIIs</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowFIIForm(true)}
              className="bg-gold hover:bg-gold/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {data.fiis.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Valorização</TableHead>
                    <TableHead>Dividendos</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.fiis.map((fii) => (
                    <TableRow key={fii.id}>
                      <TableCell>{fii.name}</TableCell>
                      <TableCell>{formatCurrency(fii.amount)}</TableCell>
                      <TableCell
                        className={fii.valorization >= 0 ? "text-green-500" : "text-red-500"}
                      >
                        {fii.valorization.toFixed(2)}%
                      </TableCell>
                      <TableCell>{formatCurrency(fii.dividends)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFII(fii.id)}
                          className="text-destructive"
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum FII adicionado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gold text-sm tracking-widest">📈 AÇÕES</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowStockForm(true)}
              className="bg-gold hover:bg-gold/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {data.stocks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Preço Médio</TableHead>
                    <TableHead>Cotação Atual</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.stocks.map((stock) => {
                    const result =
                      ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
                    return (
                      <TableRow key={stock.id}>
                        <TableCell className="font-bold">{stock.ticker}</TableCell>
                        <TableCell>{stock.quantity}</TableCell>
                        <TableCell>{formatCurrency(stock.avgPrice)}</TableCell>
                        <TableCell>{formatCurrency(stock.currentPrice)}</TableCell>
                        <TableCell
                          className={result >= 0 ? "text-green-500" : "text-red-500"}
                        >
                          {result >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                          {result.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStock(stock.id)}
                            className="text-destructive"
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma ação adicionada ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cripto */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gold text-sm tracking-widest">🪙 CRIPTO</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCryptoForm(true)}
              className="bg-gold hover:bg-gold/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {data.cryptos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moeda</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Atual</TableHead>
                    <TableHead>24h</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.cryptos.map((crypto) => (
                    <TableRow key={crypto.id}>
                      <TableCell>
                        <div>
                          <div className="font-bold">{crypto.symbol}</div>
                          <div className="text-xs text-muted-foreground">{crypto.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{crypto.amount.toFixed(8)}</TableCell>
                      <TableCell>{formatCurrency(crypto.currentPrice)}</TableCell>
                      <TableCell
                        className={crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}
                      >
                        {crypto.change24h >= 0 ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
                        {crypto.change24h.toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCrypto(crypto.id)}
                          className="text-destructive"
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma cripto adicionada ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dia Atual */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-gold text-sm tracking-widest">📊 DIA ATUAL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-3xl font-bold text-gold">
              {formatCurrency(totals.total)}
            </p>
            <p className="text-sm text-muted-foreground">Patrimônio Total</p>
          </CardContent>
        </Card>

        {/* Total de Tudo */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-gold text-sm tracking-widest">💎 TOTAL DE TUDO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gold">
                  {formatCurrency(totals.total)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reserva:</span>
                    <span className="text-foreground">{formatCurrency(totals.reserve)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">FIIs:</span>
                    <span className="text-foreground">{formatCurrency(totals.fiis)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ações:</span>
                    <span className="text-foreground">{formatCurrency(totals.stocks)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cripto:</span>
                    <span className="text-foreground">{formatCurrency(totals.cryptos)}</span>
                  </div>
                </div>
              </div>
              {pieData.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: "12px",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Análise - Onde Melhorar */}
        {analysis.length > 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-gold text-sm tracking-widest">
                🧠 ONDE MELHORAR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.type === "warning"
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-accent/10 border border-accent/20"
                  }`}
                >
                  <AlertCircle
                    className={`h-5 w-5 flex-shrink-0 ${
                      item.type === "warning" ? "text-destructive" : "text-accent"
                    }`}
                  />
                  <p className="text-sm text-foreground">{item.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-border/50">
          <p className="text-muted-foreground text-sm italic tracking-wide">
            "A disciplina constrói o império que o desejo sonha."
          </p>
        </div>
      </div>

      {/* Modals simplificados */}
      {showFIIForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adicionar FII</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                FII adicionado. Configure os valores manualmente.
              </p>
              <div className="flex gap-2">
                <Button onClick={addFII} className="flex-1 bg-gold hover:bg-gold/90">
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFIIForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showStockForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adicionar Ação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Ação adicionada. Configure os valores manualmente.
              </p>
              <div className="flex gap-2">
                <Button onClick={addStock} className="flex-1 bg-gold hover:bg-gold/90">
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowStockForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showCryptoForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Adicionar Criptomoeda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Cripto adicionada. Configure os valores manualmente.
              </p>
              <div className="flex gap-2">
                <Button onClick={addCrypto} className="flex-1 bg-gold hover:bg-gold/90">
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCryptoForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Journey;
