
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
  ArrowRight
} from "lucide-react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

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

  const totalBalance = useMemo(() => {
    return accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  }, [accounts]);

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
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black text-primary uppercase tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back to your institutional command center.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg h-12 px-6 font-bold">
          <Link href="/dashboard/accounts/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Open New Account
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 uppercase text-[10px] font-black tracking-widest">Total Net Worth</CardDescription>
            <CardTitle className="text-3xl font-black">{formatCurrency(totalBalance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-bold text-white/50">Across {accounts?.length || 0} Assets</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-t-4 border-t-accent">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-black tracking-widest">Active Accounts</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">{accounts?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-bold text-muted-foreground">Institutional Grade</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-[10px] font-black tracking-widest">System Status</CardDescription>
            <CardTitle className="text-3xl font-black text-green-600 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8" /> Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] font-bold text-muted-foreground">Encryption Active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <Landmark className="h-5 w-5" /> Your Accounts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
            ) : accounts && accounts.length > 0 ? (
              accounts.map((acc) => (
                <Card key={acc.id} className="group hover:border-accent transition-all duration-300 shadow-md hover:shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b p-6">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="bg-white text-[10px] uppercase font-black">{acc.accountType}</Badge>
                      <CreditCard className="h-5 w-5 text-slate-300 group-hover:text-accent transition-colors" />
                    </div>
                    <CardTitle className="text-2xl font-black mt-4 text-primary">{formatCurrency(acc.balance, acc.currency)}</CardTitle>
                    <CardDescription className="font-mono text-[10px] mt-1">{acc.accountNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status: {acc.status}</span>
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
              <Card className="col-span-full py-20 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50">
                <Landmark className="h-12 w-12 text-slate-300" />
                <div className="space-y-1">
                  <p className="font-black text-primary uppercase tracking-tight">No Accounts Found</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">You haven't initialized any institutional accounts yet. Start by onboarding your first asset.</p>
                </div>
                <Button asChild className="bg-accent font-bold">
                  <Link href="/dashboard/accounts/new">Get Started</Link>
                </Button>
              </Card>
            )}
          </div>
        </section>
      </div>

      <div className="pt-10 flex justify-center">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="h-3 w-3 text-green-500" />
          Authorized Access Only • AES-256 Encrypted
        </p>
      </div>
    </div>
  );
}
