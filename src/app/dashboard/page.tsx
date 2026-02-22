
"use client";

import { useMemo } from "react";
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
  AlertTriangle,
  Receipt,
  CreditCard,
  ArrowDownCircle
} from "lucide-react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, collectionGroup, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  // Global transactions query for totals
  const allTransactionsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(collectionGroup(db, "transactions"), where("customerId", "==", user.uid));
  }, [db, user?.uid]);

  const { data: allTransactions, isLoading: transactionsLoading } = useCollection(allTransactionsRef);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      const symbol = currency === 'GBP' ? '£' : '$';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      return `$${amount.toLocaleString()}`;
    }
  };

  // Calculations for Institutional Summary
  const stats = useMemo(() => {
    if (!accounts || !allTransactions) return { total: 0, current: 0, deposits: 0, withdrawals: 0 };
    
    const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const current = accounts
      .filter(acc => acc.accountType === "Current Account")
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);
    
    const deposits = allTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const withdrawals = allTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { total, current, deposits, withdrawals };
  }, [accounts, allTransactions]);

  if (isUserLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black text-primary uppercase tracking-tight">Financial Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Nexa International • Authorized Institutional Ledger</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-primary text-primary h-12 px-6">
            <Link href="/dashboard/deposit">
              <ArrowDownCircle className="mr-2 h-4 w-4" /> Deposit
            </Link>
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg h-12 px-6 font-bold">
            <Link href="/dashboard/accounts/new">
              <PlusCircle className="mr-2 h-4 w-4" /> New Account
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Account Summary Section - Mocking the requested image layout */}
        <section className="space-y-4">
          <div className="relative inline-block mb-4">
            <h2 className="text-2xl font-black text-[#333] tracking-tight">Account Summary</h2>
            <div className="absolute -bottom-2 left-0 h-1.5 w-full bg-[#E5E7EB]">
              <div className="h-full w-1/3 bg-primary" />
            </div>
          </div>

          <Card className="border-none shadow-2xl overflow-hidden rounded-xl bg-white">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Total Account Balance ($)</span>
              <span className="text-2xl font-black">{formatCurrency(stats.total)}</span>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-bold text-slate-700 max-w-[180px]">Total Current Account Balance</span>
                  <span className="text-sm font-medium text-slate-500">{formatCurrency(stats.current)}</span>
                </div>
                <div className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-bold text-slate-700">Current Loans</span>
                  <span className="text-sm font-medium text-slate-500">$ 0.00</span>
                </div>
                <div className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-bold text-slate-700">Total Deposits</span>
                  <span className="text-sm font-medium text-slate-500">{formatCurrency(stats.deposits)}</span>
                </div>
                <div className="bg-primary p-6 flex justify-between items-center text-white">
                  <span className="text-sm font-bold uppercase tracking-widest">Total Withdrawals</span>
                  <span className="text-sm font-bold">{formatCurrency(stats.withdrawals)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Checking Account Section - Mocking the requested image table */}
        <section className="space-y-4">
          <div className="relative inline-block mb-4">
            <h2 className="text-2xl font-black text-[#333] tracking-tight">Checking Account</h2>
            <div className="absolute -bottom-2 left-0 h-1.5 w-full bg-[#E5E7EB]">
              <div className="h-full w-1/3 bg-primary" />
            </div>
          </div>

          <Card className="border-none shadow-2xl overflow-hidden rounded-xl bg-white">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-primary text-white border-none">
                  <TableRow className="hover:bg-primary border-none">
                    <TableHead className="text-white font-bold text-xs uppercase h-14 border-r border-white/10">Account Number</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase h-14 border-r border-white/10">Account Name</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase h-14 border-r border-white/10">Account Type</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase h-14 border-r border-white/10">Currency</TableHead>
                    <TableHead className="text-white font-bold text-xs uppercase h-14">Current Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountsLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10">Initializing ledger...</TableCell></TableRow>
                  ) : accounts?.filter(a => a.accountType === "Current Account").map((acc) => (
                    <TableRow key={acc.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-xs">{acc.accountNumber}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-700">{user?.displayName || user?.email?.split('@')[0]}</TableCell>
                      <TableCell className="text-xs">{acc.accountType?.replace(" Account", "")}</TableCell>
                      <TableCell className="text-xs font-medium text-center">{acc.currency || 'USD'}</TableCell>
                      <TableCell className="text-xs font-black text-right text-primary">
                        {formatCurrency(acc.balance || 0, acc.currency || 'USD')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!accountsLoading && (!accounts || accounts.filter(a => a.accountType === "Current Account").length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                        No active checking accounts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Secondary Information: Live Activity */}
      <Card className="shadow-2xl border-none rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Institutional Activity Log
          </CardTitle>
          <CardDescription>Real-time transaction settlement status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Settlement</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsLoading ? (
                Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-4 w-full" /></TableCell></TableRow>)
              ) : allTransactions?.slice(0, 8).map((t) => (
                <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-[10px] font-mono">{t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : 'Today'}</TableCell>
                  <TableCell className="text-xs font-bold text-primary truncate max-w-[200px]">{t.description}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${t.amount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {t.amount > 0 ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {t.amount > 0 ? 'Credit' : 'Debit'}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-black text-sm ${t.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                    {t.amount > 0 ? '+' : '-'}{formatCurrency(Math.abs(t.amount), t.currency || 'USD')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-slate-50/50 flex justify-center py-3 border-t">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-green-500" />
            End-to-End Encrypted Institutional Data
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
