import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Header from "@/components/Header";

interface MonthData {
  month: string;
  conservador: number;
  moderado: number;
  agressivo: number;
}

interface ScenarioResult {
  name: string;
  rate: number;
  totalInvested: number;
  finalValue: number;
  profit: number;
  color: string;
}

const Simulator = () => {
  const monthlyContribution = 600;
  const months = 21; // março 2023 até novembro 2025
  const startDate = new Date(2023, 2, 1); // março 2023

  // Taxas mensais
  const scenarios = [
    { name: "Conservador", rate: 0.008, color: "hsl(var(--gold))" },
    { name: "Moderado", rate: 0.015, color: "hsl(var(--accent))" },
    { name: "Agressivo", rate: 0.03, color: "hsl(var(--primary))" },
  ];

  // Calcular evolução mensal para cada cenário
  const calculateMonthlyEvolution = (rate: number): number[] => {
    const values: number[] = [];
    let accumulated = 0;

    for (let i = 0; i < months; i++) {
      accumulated = (accumulated + monthlyContribution) * (1 + rate);
      values.push(accumulated);
    }

    return values;
  };

  // Gerar dados para o gráfico
  const chartData: MonthData[] = [];
  const conservadorValues = calculateMonthlyEvolution(scenarios[0].rate);
  const moderadoValues = calculateMonthlyEvolution(scenarios[1].rate);
  const agresivoValues = calculateMonthlyEvolution(scenarios[2].rate);

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    const monthName = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

    chartData.push({
      month: monthName,
      conservador: conservadorValues[i],
      moderado: moderadoValues[i],
      agressivo: agresivoValues[i],
    });
  }

  // Calcular resultados finais
  const totalInvested = monthlyContribution * months;
  const results: ScenarioResult[] = scenarios.map((scenario, index) => {
    const values = [conservadorValues, moderadoValues, agresivoValues][index];
    const finalValue = values[values.length - 1];
    const profit = finalValue - totalInvested;

    return {
      name: scenario.name,
      rate: scenario.rate * 100,
      totalInvested,
      finalValue,
      profit,
      color: scenario.color,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-display text-foreground mb-2">
            Simulador de Investimentos
          </h1>
          <p className="text-muted-foreground">
            Simulação de aportes mensais de {formatCurrency(monthlyContribution)} durante {months} meses
          </p>
        </div>

        {/* Resumo dos Cenários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {results.map((result) => (
            <Card key={result.name} className="border-border bg-card shadow-subtle">
              <CardHeader>
                <CardTitle className="text-xl font-display" style={{ color: result.color }}>
                  {result.name}
                </CardTitle>
                <CardDescription>
                  Rentabilidade: {result.rate.toFixed(2)}% ao mês
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(result.totalInvested)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Final</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.finalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lucro</p>
                  <p className="text-xl font-semibold" style={{ color: result.color }}>
                    {formatCurrency(result.profit)}
                  </p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Rentabilidade Total</p>
                  <p className="text-lg font-semibold" style={{ color: result.color }}>
                    {((result.profit / result.totalInvested) * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico de Evolução */}
        <Card className="border-border bg-card shadow-subtle">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-foreground">
              Evolução do Patrimônio
            </CardTitle>
            <CardDescription>
              Comparativo entre os três cenários ao longo de {months} meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend
                  wrapperStyle={{ color: "hsl(var(--foreground))" }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="conservador"
                  stroke="hsl(var(--gold))"
                  strokeWidth={2}
                  name="Conservador (0.8%)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="moderado"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  name="Moderado (1.5%)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="agressivo"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Agressivo (3.0%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="mt-6 border-border bg-card shadow-subtle">
          <CardHeader>
            <CardTitle className="text-xl font-display text-foreground">
              Sobre a Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Período:</strong> Março de 2023 a Novembro de 2025 (21 meses)</p>
            <p>• <strong>Aporte mensal:</strong> {formatCurrency(monthlyContribution)}</p>
            <p>• <strong>Total investido:</strong> {formatCurrency(totalInvested)}</p>
            <p>• <strong>Cálculo:</strong> Juros compostos com aportes mensais no início de cada mês</p>
            <p className="pt-2 text-xs italic">
              Esta é uma simulação educacional. Rentabilidades passadas não garantem resultados futuros.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Simulator;
