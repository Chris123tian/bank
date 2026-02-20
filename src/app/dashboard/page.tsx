"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  PlusCircle, 
  TrendingUp,
  Landmark,
  CircleDollarSign,
  Briefcase,
  ArrowRightLeft,
  MapPin,
  Zap,
  ShieldCheck,
  History,
  AlertTriangle
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
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const accountsRef = useMemoFirebase(() => {
    // Safe Pattern: Ensure user and db are ready before constructing reference.
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  const transactionsRef = useMemoFirebase(() => {
    // Safe Pattern: Guard against root listing by checking all required path parameters.
    if (!db || !user?.uid || !accounts?.length || !accounts[0]?.id) return null;
    return collection(db, "users", user.uid, "accounts", accounts[0].id, "transactions");
  }, [db, user?.uid, accounts]);

  const { data: recentTransactions, isLoading: transactionsLoading } = useCollection(transactionsRef);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      return `$${amount.toLocaleString()}`;
    }
  };

  if (isUserLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-foreground">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Welcome, {user?.displayName || user?.email?.split('@')[0] || 'Client'}</h1>
          <p className="text-muted-foreground mt-1">City International Bank • Personal Wealth Overview</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg">
          <Link href="/dashboard/accounts/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Open New Account
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accountsLoading ? (
          Array(3).fill(0).map((_, i) => <Card key={i} className="h-32 animate-pulse bg-slate-100" />)
        ) : !accounts || accounts.length === 0 ? (
          <Card className="col-span-3 py-16 text-center bg-white border-2 border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Landmark className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-xl text-primary">Start Your Financial Journey</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
              You haven't opened any accounts yet. Create your first Checking or Savings account today.
            </p>
            <Button variant="default" className="mt-6 bg-accent" asChild>
              <Link href="/dashboard/accounts/new">Open Your First Account</Link>
            </Button>
          </Card>
        ) : accounts.map((acc) => (
          <Card key={acc.id} className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 ${acc.status === 'Suspended' ? 'border-l-red-500' : 'border-l-primary'}`}>
            <CardHeader className="pb-2">
              <CardDescription className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                {acc.accountType}
                <span className="font-mono opacity-60">{acc.accountNumber}</span>
              </CardDescription>
              <CardTitle className="text-3xl font-bold font-headline mt-1">
                {formatCurrency(acc.balance || 0, acc.currency || 'USD')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {acc.status === 'Suspended' ? (
                <div className="flex items-center gap-2 text-xs text-red-600 font-bold bg-red-50 w-fit px-2 py-1 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  Suspended
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 w-fit px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  {acc.status || "Active Account"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Wealth Growth</CardTitle>
            <CardDescription>Visualizing your financial trajectory over the last 6 months.</CardDescription>
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Live Activity</CardTitle>
            <CardDescription>Real-time updates from your primary account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {transactionsLoading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              ) : recentTransactions?.length ? recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between group border-b border-slate-50 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${t.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {t.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none text-primary">{t.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">{t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : 'Today'}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-black ${t.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {t.amount > 0 ? `+${formatCurrency(t.amount, t.currency || 'USD')}` : `-${formatCurrency(Math.abs(t.amount), t.currency || 'USD')}`}
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 opacity-40">
                  <div className="bg-slate-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <History className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest">No recent records</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-slate-50/50 flex justify-center py-3 rounded-b-lg">
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                SECURED BY CITY BANK CRYPTO-VAULT
             </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}