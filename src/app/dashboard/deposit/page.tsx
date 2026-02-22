
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownCircle, CheckCircle2, Loader2, ShieldCheck, Landmark, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function DepositPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [targetAccountId, setTargetAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("External Bank Transfer");
  const [reference, setReference] = useState("");

  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  const handleDeposit = () => {
    if (!targetAccountId || !amount || !user || !db) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a target account and enter an amount.",
      });
      return;
    }

    const selectedAccount = accounts?.find(a => a.id === targetAccountId);
    if (!selectedAccount) return;

    setLoading(true);

    const transactionsRef = collection(db, "users", user.uid, "accounts", targetAccountId, "transactions");
    const transactionData = {
      accountId: targetAccountId,
      customerId: user.uid,
      userId: user.uid,
      transactionType: "deposit",
      amount: Number(amount), 
      currency: selectedAccount.currency || "USD",
      transactionDate: new Date().toISOString(),
      description: `Inward Deposit from ${source}${reference ? ' - ' + reference : ''}`,
      metadata: {
        source,
        reference,
        paymentMethod: "Electronic Deposit",
      },
      status: "completed",
      createdAt: serverTimestamp(),
    };

    // Update account balance
    const accountRef = doc(db, "users", user.uid, "accounts", targetAccountId);
    
    // Non-blocking writes
    addDocumentNonBlocking(transactionsRef, transactionData);
    updateDocumentNonBlocking(accountRef, {
      balance: (selectedAccount.balance || 0) + Number(amount),
      updatedAt: serverTimestamp(),
    });

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Deposit Successful",
        description: `Successfully credited ${selectedAccount.currency || '$'}${amount} to your ${selectedAccount.accountType}.`,
      });
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-headline font-black text-primary uppercase">Capital Injection</h1>
        <p className="text-muted-foreground">Inject liquidity into your institutional accounts via external sources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-2xl border-t-4 border-t-accent overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                  <ArrowDownCircle className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Authorized Deposit Form</CardTitle>
                  <CardDescription>Initiate a credit settlement from an external financial entity.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Institutional Account</Label>
                <Select value={targetAccountId} onValueChange={setTargetAccountId}>
                  <SelectTrigger className="h-14 border-slate-200 text-lg font-bold">
                    <SelectValue placeholder={accountsLoading ? "Fetching accounts..." : "Select account to credit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map(acc => (
                      <SelectItem key={acc.id} value={acc.id} className="h-12">
                        {acc.accountType} (...{acc.accountNumber.slice(-4)}) — Balance: {formatCurrency(acc.balance || 0, acc.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Funding Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="External Bank Transfer">External Bank (Wire/ACH)</SelectItem>
                      <SelectItem value="Cash Deposit">Cash Deposit (Vault Branch)</SelectItem>
                      <SelectItem value="Check Settlement">Check Deposit</SelectItem>
                      <SelectItem value="Internal Transfer">Internal Nexa Funding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount to Inject</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="pl-10 h-14 text-2xl font-black text-primary border-primary/20 bg-primary/5" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference / Memo</Label>
                <Input 
                  placeholder="e.g. Monthly Salary Injection, Asset Liquidation" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="h-12"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-8 flex flex-col sm:flex-row gap-6 justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Institutional-Grade Settlement Protection
              </div>
              <Button 
                onClick={handleDeposit} 
                disabled={loading || accountsLoading} 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Injection"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-white border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Landmark className="h-5 w-5 text-accent" />
                Audit Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs opacity-70 leading-relaxed font-medium">
                All inward deposits are subject to global AML (Anti-Money Laundering) monitoring. Large injections (> $10k) may require additional documentation for regulatory compliance.
              </p>
              <div className="h-px bg-white/10 w-full" />
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Settlement Windows</h4>
                <div className="grid grid-cols-2 text-[10px] font-bold">
                  <span className="opacity-60">Nexa Transfer</span>
                  <span className="text-right">Instant</span>
                  <span className="opacity-60">Domestic Wire</span>
                  <span className="text-right">Same Day</span>
                  <span className="opacity-60">ACH Standard</span>
                  <span className="text-right">1-2 Days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-slate-100 p-6 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Note</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              Nexa International never requests your password or MFA codes for deposits. Always ensure you are on our verified institutional domain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  function formatCurrency(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}
