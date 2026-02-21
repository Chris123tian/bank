
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Trash2, Edit3, ShieldAlert, Loader2, Eye, Receipt, User, Landmark, CreditCard, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function AdminTransactionsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [viewingTransaction, setViewingTransaction] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const isMasterAdmin = user?.email === "citybank@gmail.com";
  const isAdminConfirmed = isMasterAdmin || (!!adminRole && !isAdminRoleLoading);
  
  const isAdminReady = isMasterAdmin || (!isAdminRoleLoading && isAdminConfirmed);

  const transactionsRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collectionGroup(db, "transactions");
  }, [db, isAdminReady]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsRef);

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

  const handleUpdateTransaction = () => {
    if (!editingTransaction || !db) return;

    const path = `users/${editingTransaction.customerId || editingTransaction.userId}/accounts/${editingTransaction.accountId}/transactions/${editingTransaction.id}`;
    const docRef = doc(db, path);

    updateDocumentNonBlocking(docRef, {
      description: editingTransaction.description ?? "",
      amount: Number(editingTransaction.amount) || 0,
      status: editingTransaction.status ?? "pending",
      transactionDate: editingTransaction.transactionDate ?? new Date().toISOString(),
      transactionType: editingTransaction.transactionType ?? "withdrawal",
      currency: editingTransaction.currency ?? "USD",
    });

    toast({ title: "Transaction Updated", description: "Audit trail record has been modified." });
    setEditingTransaction(null);
    setIsEditDialogOpen(false);
  };

  const handleDelete = (transaction: any) => {
    if (!db) return;
    const path = `users/${transaction.customerId || transaction.userId}/accounts/${transaction.accountId}/transactions/${transaction.id}`;
    const docRef = doc(db, path);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Transaction Deleted", description: "Audit trail updated." });
  };

  if (isAdminRoleLoading && !isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Validating Role...</p>
      </div>
    );
  }

  if (!isAdminConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-foreground">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 rounded-xl text-red-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Global Transaction Audit</h1>
          <p className="text-muted-foreground">Institutional oversight and metadata analysis for all financial movements.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Settlement Ledger</CardTitle>
          <CardDescription>Auditing transactions and cross-border metadata across City International Bank.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Settlement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isTransactionsLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">Auditing network...</TableCell></TableRow>
              ) : transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs font-mono">{tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-xs font-mono truncate max-w-[100px]">{tx.customerId || tx.userId}</TableCell>
                  <TableCell className="font-medium truncate max-w-[200px]">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-[10px]">{tx.transactionType || "Other"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{tx.status}</Badge>
                  </TableCell>
                  <TableCell className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewingTransaction(tx)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400" 
                      onClick={() => {
                        setEditingTransaction({
                          ...tx,
                          amount: tx.amount ?? 0,
                          currency: tx.currency ?? "USD",
                          status: tx.status ?? "pending",
                          transactionType: tx.transactionType ?? "withdrawal"
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(tx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isTransactionsLoading && (!transactions || transactions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">
                    No transaction records found in the global network.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction View Dialog */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-slate-950 text-white rounded-3xl">
          <DialogHeader className="p-8 bg-primary/20 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${viewingTransaction?.amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Transaction Insight</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs font-mono">Reference: {viewingTransaction?.id}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-8">
            <div className="space-y-8">
              {/* Core Financials */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Amount</Label>
                  <p className={`text-3xl font-black ${viewingTransaction?.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                    {viewingTransaction?.amount > 0 ? '+' : '-'}{formatCurrency(viewingTransaction?.amount || 0, viewingTransaction?.currency || 'USD')}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Execution Date</Label>
                  <p className="text-lg font-bold">
                    {viewingTransaction?.transactionDate ? new Date(viewingTransaction.transactionDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Identity & Path */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Client Identity</span>
                  </div>
                  <p className="text-sm font-mono bg-white/5 p-3 rounded-xl border border-white/5 truncate">
                    {viewingTransaction?.customerId || viewingTransaction?.userId}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Landmark className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Account ID</span>
                  </div>
                  <p className="text-sm font-mono bg-white/5 p-3 rounded-xl border border-white/5 truncate">
                    {viewingTransaction?.accountId}
                  </p>
                </div>
              </div>

              {/* Settlement Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Send className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Settlement Description</span>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-slate-300 bg-white/5 p-4 rounded-xl">
                  "{viewingTransaction?.description}"
                </p>
              </div>

              {/* TRANSFER METADATA (Recipient Information) */}
              {viewingTransaction?.metadata && (
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-2 text-accent">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Institutional Metadata (Audit)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-accent/5 p-6 rounded-2xl border border-accent/20">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Recipient Name</Label>
                      <p className="text-sm font-bold text-white">{viewingTransaction.metadata.recipientName || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Recipient Account</Label>
                      <p className="text-sm font-mono text-white">{viewingTransaction.metadata.recipientAccount || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Routing / IBAN</Label>
                      <p className="text-sm font-mono text-white">{viewingTransaction.metadata.routingOrIban || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Payment Method</Label>
                      <p className="text-sm font-bold text-accent">{viewingTransaction.metadata.paymentMethod || '—'}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Receiving Institution</Label>
                      <p className="text-sm font-bold text-white">{viewingTransaction.metadata.bankName || '—'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{viewingTransaction.metadata.bankAddress || '—'}</p>
                    </div>
                    {viewingTransaction.metadata.note && (
                      <div className="space-y-1 md:col-span-2 mt-2">
                        <Label className="text-[9px] font-bold uppercase text-slate-500">Reference Note</Label>
                        <p className="text-xs text-slate-300 italic">"{viewingTransaction.metadata.note}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                <span>Security Level: Institutional</span>
                <span>Verification: Nexa-Authenticated</span>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-6 bg-white/5 shrink-0">
            <Button onClick={() => setViewingTransaction(null)} className="bg-primary hover:bg-primary/90 rounded-xl w-full">
              Dismiss Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (Existing) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Transaction Record</DialogTitle>
            <DialogDescription>Administrative override for record ID: {editingTransaction?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Date</Label>
              <Input 
                type="datetime-local" 
                value={editingTransaction?.transactionDate?.slice(0, 16) ?? ""} 
                onChange={(e) => setEditingTransaction({...editingTransaction, transactionDate: new Date(e.target.value).toISOString()})}
              />
            </div>
            <div className="space-y-2">
              <Label>Merchant / Description</Label>
              <Input 
                value={editingTransaction?.description ?? ""} 
                onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Category (Type)</Label>
              <Select 
                value={editingTransaction?.transactionType ?? "withdrawal"} 
                onValueChange={(v) => setEditingTransaction({...editingTransaction, transactionType: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="bill_payment">Bill Payment</SelectItem>
                  <SelectItem value="card_payment">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input 
                type="number" 
                step="0.01"
                value={editingTransaction?.amount ?? ""} 
                onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={editingTransaction?.currency ?? "USD"} 
                onValueChange={(v) => setEditingTransaction({...editingTransaction, currency: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={editingTransaction?.status ?? "pending"} 
                onValueChange={(v) => setEditingTransaction({...editingTransaction, status: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateTransaction} className="w-full">Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
