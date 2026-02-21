"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function NewAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState("Current Account");

  const handleOpenAccount = async () => {
    if (!user || !db) return;
    setLoading(true);

    const accountsRef = collection(db, "users", user.uid, "accounts");
    const accountData = {
      accountNumber: `CITY-${Math.floor(10000000 + Math.random() * 90000000)}`,
      accountType: accountType,
      balance: accountType === "Savings Account" ? 250 : 100, // Special bonus for savings
      currency: "USD",
      userId: user.uid,
      customerId: user.uid,
      branchId: "usa_head_office",
      status: "Active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    addDocumentNonBlocking(accountsRef, accountData);
    
    setTimeout(() => {
      toast({ 
        title: "Account Opened!", 
        description: `Your new City Bank ${accountData.accountType} is active.` 
      });
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary p-3 rounded-2xl text-white shadow-lg">
          <Landmark className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Initialize Institutional Account</h1>
          <p className="text-muted-foreground text-sm">Expand your global financial footprint with Nexa International.</p>
        </div>
      </div>

      <Card className="shadow-xl border-t-4 border-t-accent">
        <CardHeader>
          <CardTitle>Select Your Account Type</CardTitle>
          <CardDescription>Choose the banking product that best fits your capital requirements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-xs uppercase font-black tracking-widest text-slate-500">Account Category</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger className="h-12 text-base font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Current Account">Current Account (Daily Operations)</SelectItem>
                <SelectItem value="Savings Account">Savings Account (High-Yield 5.25%)</SelectItem>
                <SelectItem value="Business Account">Business Account (Corporate Liquidity)</SelectItem>
                <SelectItem value="Internet Banking">Internet Banking Portal (Digital Only)</SelectItem>
                <SelectItem value="Safety Deposits">Safety Deposits (Asset Vaulting)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Standard Institutional Benefits:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium text-muted-foreground">
              <li className="flex items-center gap-2">• Zero Monthly Maintenance Fees</li>
              <li className="flex items-center gap-2">• Global ATM Fee Reimbursement</li>
              <li className="flex items-center gap-2">• AES-256 Secure Encryption</li>
              <li className="flex items-center gap-2">• Instant NexaNetwork Settlement</li>
            </ul>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[10px] font-black text-accent uppercase tracking-widest">Initial Asset Injection Bonus</p>
              <p className="text-2xl font-black text-primary">${accountType === "Savings Account" ? '250.00' : '100.00'}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-xl" 
            onClick={handleOpenAccount}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                Confirm Initialization
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-[9px] text-center text-muted-foreground uppercase font-black tracking-tighter leading-tight">
            By initializing this account, you agree to the Nexa International Global Banking Disclosure, Privacy Policy, and Institutional Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
