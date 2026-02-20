"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Send, PlusCircle, Repeat, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function TransferPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountLabel, setToAccountLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  const handleTransfer = () => {
    if (!fromAccountId || !amount || !user || !db) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an account and enter an amount.",
      });
      return;
    }

    const selectedAccount = accounts?.find(a => a.id === fromAccountId);
    if (!selectedAccount) return;

    if (selectedAccount.balance < Number(amount)) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: "The selected account does not have enough balance for this transfer.",
      });
      return;
    }

    setLoading(true);

    // Create the transaction record
    const transactionsRef = collection(db, "users", user.uid, "accounts", fromAccountId, "transactions");
    const transactionData = {
      accountId: fromAccountId,
      customerId: user.uid, // Required for authorization rules
      transactionType: "transfer",
      amount: -Number(amount), 
      currency: selectedAccount.currency || "USD",
      transactionDate: new Date().toISOString(),
      description: note || `Transfer to ${toAccountLabel || 'External Account'}`,
      status: "completed",
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(transactionsRef, transactionData);

    // Update account balance
    const accountRef = doc(db, "users", user.uid, "accounts", fromAccountId);
    updateDocumentNonBlocking(accountRef, {
      balance: selectedAccount.balance - Number(amount),
      updatedAt: serverTimestamp(),
    });

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Transfer Successful",
        description: `Successfully moved ${selectedAccount.currency || '$'}${amount} to ${toAccountLabel || 'destination'}.`,
      });
      setAmount("");
      setNote("");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-headline font-bold text-primary">Move Money</h1>
        <p className="text-muted-foreground">Transfer funds between accounts or to external recipients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Send className="h-5 w-5 text-accent" />
              Transfer Details
            </CardTitle>
            <CardDescription>Configure your transfer parameters below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Account</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={accountsLoading ? "Loading accounts..." : "Select account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountType} (...{acc.accountNumber.slice(-4)}) - {acc.currency || '$'}{acc.balance?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Account</Label>
                <Select onValueChange={setToAccountLabel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Savings Goal">Savings Goal (...4390)</SelectItem>
                    <SelectItem value="Dave (Chase)">Chase Checking (*4412) - Dave</SelectItem>
                    <SelectItem value="Rent Management">Bank of America (*9902) - Rental</SelectItem>
                    <SelectItem value="new">+ Add New External Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-8 text-lg font-bold" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Input 
                placeholder="e.g. Rent Payment, Dinner Reimbursement" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 bg-secondary/50 p-3 rounded-lg">
              <Checkbox id="recurring" />
              <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                <Repeat className="h-4 w-4" />
                Make this a recurring transfer
              </Label>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 flex justify-end gap-3 rounded-b-lg p-6">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleTransfer} disabled={loading || accountsLoading} className="bg-accent hover:bg-accent/90 min-w-[140px]">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Confirm Transfer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "David Chen", initial: "DC" },
                { name: "Rent Management", initial: "RM" },
                { name: "Savings Goal", initial: "SG" },
              ].map((contact) => (
                <button 
                  key={contact.name} 
                  onClick={() => setToAccountLabel(contact.name)}
                  className="flex items-center gap-3 w-full p-2 hover:bg-secondary rounded-lg transition-colors group text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                    {contact.initial}
                  </div>
                  <span className="text-sm font-medium">{contact.name}</span>
                </button>
              ))}
              <Button variant="ghost" className="w-full text-accent flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Payee
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Security First</CardTitle>
            </CardHeader>
            <CardContent className="text-sm opacity-80 leading-relaxed">
              Internal transfers are instant. External transfers via NexaNetwork typically arrive within 24 hours. No fees for standard transfers.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}