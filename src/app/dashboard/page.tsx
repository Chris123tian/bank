"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  PlusCircle, 
  TrendingUp,
  Landmark,
  ShieldCheck
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  XAxis, 
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const accountsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  const transactionsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    // We would typically use a collectionGroup for 'transactions' scoped to user or list from specific accounts
    // For MVP, we'll assume a collection group query or list from the first account
    return collection(db, "users", user.uid, "accounts", accounts?.[0]?.id || "none", "transactions");
  }, [db, user, accounts]);

  const { data: recentTransactions } = useCollection(transactionsRef);

  const handleOpenAccount = () => {
    if (!user) return;
    const accountData = {
      accountNumber: `CITY-${Math.floor(10000000 + Math.random() * 90000000)}`,
      accountType: "Checking",
      balance: 0,
      currency: "USD",
      userId: user.uid,
      branchId: "usa_head_office",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    addDocumentNonBlocking(accountsRef!, accountData);
    toast({ title: "Account Opened", description: "Your new City Bank Checking account is ready." });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Welcome, {user?.displayName || 'Client'}</h1>
          <p className="text-muted-foreground mt-1">City International Bank • Personal Wealth Overview</p>
        </div>
        <Button onClick={handleOpenAccount} className="bg-accent hover:bg-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Open New Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accountsLoading ? (
          Array(3).fill(0).map((_, i) => <Card key={i} className="h-32 animate-pulse bg-slate-100" />)
        ) : accounts?.length === 0 ? (
          <Card className="col-span-3 py-10 text-center bg-slate-50 border-dashed">
            <Landmark className="h-10 w-10 mx-auto text-slate-300 mb-4" />
            <h3 className="font-bold">No active accounts</h3>
            <p className="text-sm text-muted-foreground">Open your first account to get started with City Bank.</p>
            <Button variant="link" onClick={handleOpenAccount}>Create Account Now</Button>
          </Card>
        ) : accounts?.map((acc) => (
          <Card key={acc.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardDescription className="flex justify-between items-center">
                {acc.accountType}
                <span className="text-[10px] font-mono opacity-50">{acc.accountNumber}</span>
              </CardDescription>
              <CardTitle className="text-2xl font-bold font-headline">${acc.balance.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                Active Account
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Wealth Trends</CardTitle>
            <CardDescription>Monthly growth and spending trajectory.</CardDescription>
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
            <CardDescription>Latest movements in your primary account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTransactions?.length ? recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {t.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{t.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 text-black">{t.transactionDate}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${t.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {t.amount > 0 ? `+$${t.amount}` : `-$${Math.abs(t.amount)}`}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-40">
                  <History className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">No recent transactions</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-slate-50/50 flex justify-center py-3">
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                SECURED BY CITY BANK ENCRYPTION
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
import { History } from "lucide-react";
