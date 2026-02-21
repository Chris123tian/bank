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
  const [accountType, setAccountType] = useState("checking");

  const handleOpenAccount = async () => {
    if (!user || !db) return;
    setLoading(true);

    const accountsRef = collection(db, "users", user.uid, "accounts");
    const accountData = {
      accountNumber: `CITY-${Math.floor(10000000 + Math.random() * 90000000)}`,
      accountType: accountType.charAt(0).toUpperCase() + accountType.slice(1),
      balance: accountType === "savings" ? 250 : 100, // Special bonus for savings
      currency: "USD",
      userId: user.uid,
      customerId: user.uid, // Explicitly add customerId for admin group queries
      branchId: "usa_head_office",
      status: "Active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    addDocumentNonBlocking(accountsRef, accountData);
    
    setTimeout(() => {
      toast({ 
        title: "Account Opened!", 
        description: `Your new City Bank ${accountData.accountType} account is active.` 
      });
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary p-3 rounded-2xl text-white shadow-lg">
          <Landmark className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Open New Account</h1>
          <p className="text-muted-foreground">Expand your global financial footprint with City International Bank.</p>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Select Your Account Type</CardTitle>
          <CardDescription>Choose the banking product that best fits your goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Account Category</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Premier Checking (Daily Transactions)</SelectItem>
                <SelectItem value="savings">High-Yield Savings (5.25% APY)</SelectItem>
                <SelectItem value="investment">Wealth Investment Portal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Included Benefits:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">• No Monthly Maintenance Fees</li>
              <li className="flex items-center gap-2">• Global ATM Fee Reimbursement</li>
              <li className="flex items-center gap-2">• 256-bit Secure Encryption</li>
              <li className="flex items-center gap-2">• Instant NexaNetwork Transfers</li>
            </ul>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Initial Deposit Bonus</p>
              <p className="text-xl font-black text-primary">${accountType === "savings" ? '250.00' : '100.00'}</p>
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
                Initialize My Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-tighter">
            By clicking above, you agree to our Global Banking Disclosure & Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
