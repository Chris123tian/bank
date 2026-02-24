
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowRight, Loader2, ShieldCheck, Landmark, History, ShieldAlert, CheckCircle2, X, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function TransferPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  
  // Receipt State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Form State
  const [fromAccountId, setFromAccountId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [routingOrIban, setRoutingOrIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online Transfer");

  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  const selectedAccount = accounts?.find(a => a.id === fromAccountId);
  const isAccountRestricted = selectedAccount && selectedAccount.status !== 'Active';

  // Sync currency with selected account
  useEffect(() => {
    if (selectedAccount?.currency) {
      setCurrency(selectedAccount.currency);
    }
  }, [selectedAccount]);

  const handleTransfer = () => {
    if (!fromAccountId || !amount || !recipientName || !recipientAccount || !user || !db) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please complete all required fields (Source, Recipient, and Amount).",
      });
      return;
    }

    if (!selectedAccount) return;

    if (isAccountRestricted) {
      toast({
        variant: "destructive",
        title: "Regulatory Lockdown Active",
        description: "This account has been placed on an administrative hold, contact customer support for assistance. Outgoing capital movements are strictly prohibited until the restriction is lifted.",
      });
      return;
    }

    if (selectedAccount.balance < Number(amount)) {
      toast({
        variant: "destructive",
        title: "Insufficient Liquidity",
        description: "The selected account does not have sufficient funds to settle this transaction.",
      });
      return;
    }

    setLoading(true);

    const txId = `CITY-TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const transactionsRef = collection(db, "users", user.uid, "accounts", fromAccountId, "transactions");
    const transactionData = {
      accountId: fromAccountId,
      customerId: user.uid,
      userId: user.uid,
      transactionType: "transfer",
      amount: -Number(amount), 
      currency: currency,
      transactionDate: new Date().toISOString(),
      description: `Transfer to ${recipientName} (${recipientAccount}) - ${paymentMethod}`,
      metadata: {
        recipientName,
        recipientAccount,
        routingOrIban,
        bankName,
        bankAddress,
        paymentMethod,
        note
      },
      status: "completed",
      createdAt: serverTimestamp(),
    };

    // 1. Log Transaction
    addDocumentNonBlocking(transactionsRef, transactionData);

    // 2. Adjust Balance
    const accountRef = doc(db, "users", user.uid, "accounts", fromAccountId);
    updateDocumentNonBlocking(accountRef, {
      balance: selectedAccount.balance - Number(amount),
      updatedAt: serverTimestamp(),
    });

    setTimeout(() => {
      setLoading(false);
      setReceiptData({
        id: txId,
        amount: Number(amount),
        currency,
        recipientName,
        recipientAccount,
        bankName,
        method: paymentMethod,
        reference: note,
        date: new Date().toISOString(),
        senderAccount: selectedAccount.accountNumber,
        newBalance: selectedAccount.balance - Number(amount)
      });
      setIsReceiptOpen(true);
      
      // Reset Form
      setRecipientName("");
      setRecipientAccount("");
      setRoutingOrIban("");
      setBankName("");
      setBankAddress("");
      setAmount("");
      setNote("");
    }, 1200);
  };

  const formatCurrency = (val: number, cur: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(val);
  };

  const maskAccount = (acc: string) => {
    if (!acc) return "••••";
    return `•••• ${acc.slice(-4)}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Move Capital</h1>
        <p className="text-muted-foreground">Secure global settlement via Institutional Rails.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-lg border-t-4 border-t-accent overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Transfer Authorization Form</CardTitle>
                  <CardDescription>Fill in recipient details for cross-border or domestic settlement.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source Account</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId}>
                  <SelectTrigger className={`h-12 ${isAccountRestricted ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                    <SelectValue placeholder={accountsLoading ? "Fetching accounts..." : "Select account to debit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        <div className="flex items-center gap-2">
                          <span>{acc.accountType} (...{acc.accountNumber.slice(-4)}) — Balance: {formatCurrency(acc.balance || 0, acc.currency || 'USD')}</span>
                          {acc.status !== 'Active' && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 rounded uppercase">{acc.status}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {isAccountRestricted && (
                  <div className="flex items-center gap-3 mt-3 p-4 bg-red-50 border border-red-100 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                    <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Regulatory Lockdown Active</p>
                      <p className="text-xs text-red-500 font-medium">This account has been placed on an administrative hold, contact customer support for assistance. Outgoing capital movements are strictly prohibited until the restriction is lifted.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b pb-2">Recipient Information</h4>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Account Holder Name</Label>
                    <Input placeholder="Full legal name or business entity" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} disabled={isAccountRestricted} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Account Number</Label>
                    <Input placeholder="Account number" value={recipientAccount} onChange={(e) => setRecipientAccount(e.target.value)} disabled={isAccountRestricted} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Routing Number / IBAN</Label>
                    <Input placeholder="SWIFT/BIC, Routing, or IBAN" value={routingOrIban} onChange={(e) => setRoutingOrIban(e.target.value)} disabled={isAccountRestricted} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b pb-2">Receiving Bank Information</h4>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Bank Name</Label>
                    <Input placeholder="Financial institution name" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isAccountRestricted} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Bank Address</Label>
                    <Input placeholder="Branch location or head office" value={bankAddress} onChange={(e) => setBankAddress(e.target.value)} disabled={isAccountRestricted} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isAccountRestricted}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online Transfer">Online Global Transfer</SelectItem>
                        <SelectItem value="Wire Transfer">Wire Transfer (Same Day)</SelectItem>
                        <SelectItem value="ACH Settlement">ACH Settlement (Standard)</SelectItem>
                        <SelectItem value="SWIFT International">SWIFT International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transfer Amount</Label>
                  <div className="flex gap-2">
                    <Select value={currency} onValueChange={setCurrency} disabled={isAccountRestricted}>
                      <SelectTrigger className="w-[100px] h-12 font-black text-primary border-primary/20 bg-primary/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="0.00" className="flex-1 h-12 text-xl font-black text-primary border-primary/20 bg-primary/5 focus-visible:ring-primary" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isAccountRestricted} />
                  </div>
                  <p className="text-[9px] text-muted-foreground">Exchange rates and fees may apply to international wires.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reference / Note (Optional)</Label>
                  <Textarea placeholder="Reference for recipient's ledger" className="min-h-[70px] resize-none" value={note} onChange={(e) => setNote(e.target.value)} disabled={isAccountRestricted} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck className={`h-3 w-3 ${isAccountRestricted ? 'text-slate-300' : 'text-green-500'}`} />
                AES-256 Multi-Sig Authorization Active
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none" disabled={loading}>Cancel</Button>
                <Button onClick={handleTransfer} disabled={loading || accountsLoading || isAccountRestricted || !fromAccountId} className={`flex-1 sm:flex-none min-w-[180px] h-11 ${isAccountRestricted ? 'bg-slate-200 text-slate-400' : 'bg-accent hover:bg-accent/90'}`}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <><Send className="mr-2 h-4 w-4" /> Authorize Transfer</>}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-white border-none shadow-xl">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Landmark className="h-5 w-5" /> Global Settlement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs opacity-70 leading-relaxed font-medium">Internal Global-to-Global transfers are finalized instantly. SWIFT and International Wires may take 1-3 business days for final clearance.</p>
                <div className="h-px bg-white/10 w-full" />
                <ul className="text-[10px] space-y-2 opacity-90 font-bold uppercase tracking-widest">
                  <li className="flex justify-between"><span>Domestic ACH:</span> <span className="text-accent">Free</span></li>
                  <li className="flex justify-between"><span>Instant Internal:</span> <span className="text-accent">Free</span></li>
                  <li className="flex justify-between"><span>Wire (Same Day):</span> <span>$15.00</span></li>
                  <li className="flex justify-between"><span>International:</span> <span>$25.00</span></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><History className="h-3 w-3" /> Frequent Recipients</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Rental Mgmt", bank: "Wells Fargo" },
                { name: "Family Trust", bank: "HSBC London" },
              ].map((rec) => (
                <button key={rec.name} onClick={() => { setRecipientName(rec.name); setBankName(rec.bank); }} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left group" disabled={isAccountRestricted}>
                  <div>
                    <p className={`text-sm font-bold transition-colors ${isAccountRestricted ? 'text-slate-300' : 'text-primary group-hover:text-accent'}`}>{rec.name}</p>
                    <p className="text-[10px] text-muted-foreground">{rec.bank}</p>
                  </div>
                  <ArrowRight className={`h-3 w-3 transition-all ${isAccountRestricted ? 'opacity-0' : 'opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'}`} />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* INSTITUTIONAL RECEIPT MODAL */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
          <div className="bg-white p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight">Payment Completed</h2>
                <p className="text-xs text-muted-foreground font-medium">Institutional transfer authorized successfully.</p>
              </div>
            </div>

            {receiptData && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Dispatched</p>
                  <p className="text-4xl font-black text-primary">{formatCurrency(receiptData.amount, receiptData.currency)}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Status</span>
                    <Badge className="bg-green-100 text-green-700 font-black uppercase text-[9px]">COMPLETED</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Execution Date</span>
                    <span className="font-medium text-slate-700">{format(new Date(receiptData.date), "MMM dd, yyyy HH:mm:ss")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Source</span>
                    <span className="font-mono text-xs font-bold text-slate-700">{maskAccount(receiptData.senderAccount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Recipient</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-700">{receiptData.recipientName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{maskAccount(receiptData.recipientAccount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Reference</span>
                    <span className="font-medium text-slate-700 italic">{receiptData.reference || "None"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Transaction ID</span>
                    <span className="font-mono text-[10px] font-black text-accent">{receiptData.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">Fees & Charges</span>
                    <span className="font-bold text-green-600">No Fee</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold">Running Balance</span>
                    <span className="font-black text-primary">{formatCurrency(receiptData.newBalance, receiptData.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="outline" className="h-12 font-bold rounded-xl" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" /> Receipt
              </Button>
              <Button className="h-12 bg-primary font-black uppercase tracking-widest rounded-xl shadow-xl" onClick={() => setIsReceiptOpen(false)}>
                Done
              </Button>
            </div>
            
            <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
              Authorized by City Bank Global Institutional Rails
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
