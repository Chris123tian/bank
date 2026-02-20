
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CreditCard, 
  TrendingUp 
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const accounts = [
  { name: "Main Checking", number: "....8821", balance: "$24,562.00", color: "bg-primary" },
  { name: "Savings Plus", number: "....4390", balance: "$112,045.33", color: "bg-green-600" },
  { name: "Nexa Platinum Card", number: "....1201", balance: "$1,240.12", color: "bg-slate-800" },
];

const chartData = [
  { month: "Jan", income: 4500, expenses: 3200 },
  { month: "Feb", income: 5200, expenses: 3800 },
  { month: "Mar", income: 4800, expenses: 4100 },
  { month: "Apr", income: 6100, expenses: 3900 },
  { month: "May", income: 5900, expenses: 4400 },
  { month: "Jun", income: 6300, expenses: 4100 },
];

const chartConfig = {
  income: { label: "Income", color: "hsl(var(--primary))" },
  expenses: { label: "Expenses", color: "hsl(var(--accent))" },
};

const transactions = [
  { id: 1, name: "Apple Store", date: "Oct 24, 2023", amount: "-$1,299.00", type: "Expense" },
  { id: 2, name: "Monthly Salary", date: "Oct 22, 2023", amount: "+$5,500.00", type: "Income" },
  { id: 3, name: "Starbucks Coffee", date: "Oct 21, 2023", amount: "-$6.45", type: "Expense" },
  { id: 4, name: "Netflix Subscription", date: "Oct 20, 2023", amount: "-$15.99", type: "Expense" },
  { id: 5, name: "Zelle Transfer - Mom", date: "Oct 18, 2023", amount: "+$200.00", type: "Income" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor your wealth and spending across all accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <Card key={acc.name} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 left-0 w-1 h-full ${acc.color}`} />
            <CardHeader className="pb-2">
              <CardDescription className="flex justify-between items-center">
                {acc.name}
                <span className="text-[10px] font-mono opacity-50">{acc.number}</span>
              </CardDescription>
              <CardTitle className="text-2xl font-bold font-headline">{acc.balance}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                +2.4% from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Cash Flow Analytics</CardTitle>
            <CardDescription>Monthly income vs. expenses overview.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-headline">Recent Activity</CardTitle>
            <CardDescription>Latest movements in your accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.amount.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {t.amount.startsWith('+') ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.date}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${t.amount.startsWith('+') ? 'text-green-600' : 'text-foreground'}`}>
                    {t.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
