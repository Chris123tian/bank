"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  Wallet, 
  PlusCircle, 
  Landmark,
  ShieldCheck,
  History,
  CreditCard,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  ArrowDownRight
} from "lucide-react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, collectionGroup, query, where, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Fetch Accounts
  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  // Fetch Recent Transactions across ALL accounts using mandatory customerId filter for security compliance
  const recentTransactionsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    // Security Rule Alignment: The collectionGroup query MUST filter by customerId to satisfy permissions
    return query(
      collectionGroup(db, "transactions"),
      where("customerId", "==", user.uid),
      orderBy("transactionDate", "desc"),
      limit(5)
    );
  }, [db, user?.uid]);

  const { data: recentTransactions, isLoading: transactionsLoading } = useCollection(recentTransactionsRef);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(Math.abs(amount));
    } catch (e) {
      return `$${Math.abs(amount).toLocaleString()}`;
    }
  };

  const totalBalance = useMemo(() => {
    return accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  }, [accounts]);

  if (isUserLoading && !accounts) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 px-1">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-black text-primary uppercase tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back to your institutional command center.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg h-11 sm:h-12 px-6 font-bold w-full sm:w-auto">
          <Link href="/dashboard/accounts/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Open New Account
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
            <Wallet className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 uppercase text-[10px] font-black tracking-widest">Total Net Worth</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-black">{formatCurrency(totalBalance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-bold text-white/50">Across {accounts?.length || 0} Assets</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-t-4 border-t-accent bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-black tracking-widest text-slate-400">Active Accounts</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-black text-primary">{accounts?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Verified Institutional Grade</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-t-4 border-t-green-500 bg-white md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-black tracking-widest text-slate-400">System Status</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl font-black text-green-600 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7" /> Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">AES-256 Encryption Active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Your Accounts Section */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <Landmark className="h-5 w-5" /> Your Accounts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accountsLoading ? (
              Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
            ) : accounts && accounts.length > 0 ? (
              accounts.map((acc) => (
                <Card key={acc.id} className={`group hover:border-accent transition-all duration-300 shadow-md hover:shadow-xl rounded-2xl overflow-hidden bg-white ${acc.status !== 'Active' ? 'border-red-200' : ''}`}>
                  <CardHeader className="bg-slate-50/50 border-b p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="bg-white text-[9px] sm:text-[10px] uppercase font-black px-2 w-fit">{acc.accountType}</Badge>
                        {acc.status !== 'Active' && (
                          <Badge variant="destructive" className="text-[8px] uppercase font-black px-2 flex items-center gap-1">
                            <AlertTriangle className="h-2 w-2" /> {acc.status}
                          </Badge>
                        )}
                      </div>
                      <CreditCard className="h-5 w-5 text-slate-300 group-hover:text-accent transition-colors" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black mt-4 text-primary">{formatCurrency(acc.balance, acc.currency)}</CardTitle>
                    <CardDescription className="font-mono text-[9px] sm:text-[10px] mt-1">{acc.accountNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${acc.status !== 'Active' ? 'text-red-500' : 'text-slate-400'}`}>Status: {acc.status}</span>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-accent hover:text-accent hover:bg-accent/5" asChild>
                        <Link href="/dashboard/transactions">
                          Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full py-16 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 rounded-3xl">
                <Landmark className="h-12 w-12 text-slate-300" />
                <p className="font-black text-primary uppercase tracking-tight">No Accounts Found</p>
                <Button asChild className="bg-accent font-black h-11 px-8 rounded-full shadow-lg">
                  <Link href="/dashboard/accounts/new">Initialize First Asset</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity Section - AGGREGATED */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Activity
            </h2>
            <Link href="/dashboard/transactions" className="text-[10px] font-bold uppercase text-accent hover:underline">View All</Link>
          </div>

          <Card className="shadow-lg rounded-2xl overflow-hidden border-none">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {transactionsLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex gap-4 items-center">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : recentTransactions && recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                          {tx.amount > 0 ? <TrendingUp className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-primary uppercase truncate tracking-tighter leading-tight">{tx.description}</p>
                          <p className="text-[9px] text-muted-foreground font-bold">{tx.transactionDate ? format(new Date(tx.transactionDate), "MMM dd, yyyy") : 'Pending'}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-black whitespace-nowrap ml-2 ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                        {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                    <History className="h-8 w-8 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No recent transactions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative border-none">
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest text-accent mb-2">Security Notice</h4>
            <p className="text-[10px] leading-relaxed opacity-70 font-medium">
              City International Bank will never ask for your temporary credentials via email or phone. Always verify the secure padlock icon in your browser.
            </p>
          </Card>
        </div>
      </div>

      <div className="pt-10 flex justify-center border-t border-slate-200">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-green-500" />
          Authorized Access Only • 2048-bit RSA Verification
        </p>
      </div>
    </div>
  );
}