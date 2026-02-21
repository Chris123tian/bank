
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
import { Trash2, Edit3, ShieldAlert, Loader2, Eye, Receipt, User, Landmark, CreditCard, Send, Search } from "lucide-react";
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
  const [search, setSearch] = useState("");

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

  const filteredTransactions = transactions?.filter(tx => 
    tx.description?.toLowerCase().includes(search.toLowerCase()) || 
    (tx.customerId || tx.userId)?.toLowerCase().includes(search.toLowerCase()) ||
    tx.id.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Global Transaction Audit</h1>
            <p className="text-muted-foreground">Institutional oversight and metadata analysis for all financial movements.</p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search audit trail..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              ) : filteredTransactions?.map((tx) => (
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
              {!isTransactionsLoading && (!filteredTransactions || filteredTransactions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">
                    No transaction records matching your query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction View Dialog - CRITICAL AUDIT INSPECTOR */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-slate-950 text-white rounded-3xl shadow-2xl">
          <DialogHeader className="p-8 bg-primary/20 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${viewingTransaction?.amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Audit Insight</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs font-mono">Reference ID: {viewingTransaction?.id}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8">
              {/* Core Settlement Data */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Settlement</Label>
                  <p className={`text-3xl font-black ${viewingTransaction?.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                    {viewingTransaction?.amount > 0 ? '+' : '-'}{formatCurrency(viewingTransaction?.amount || 0, viewingTransaction?.currency || 'USD')}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Execution Timestamp</Label>
                  <p className="text-lg font-bold">
                    {viewingTransaction?.transactionDate ? new Date(viewingTransaction.transactionDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Path & Identity Path */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Client Identity (UID)</span>
                  </div>
                  <p className="text-xs font-mono bg-white/5 p-3 rounded-xl border border-white/5 break-all">
                    {viewingTransaction?.customerId || viewingTransaction?.userId}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Landmark className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Account Ledger ID</span>
                  </div>
                  <p className="text-xs font-mono bg-white/5 p-3 rounded-xl border border-white/5 break-all">
                    {viewingTransaction?.accountId}
                  </p>
                </div>
              </div>

              {/* PUBLIC DESCRIPTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Send className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Public Ledger Memo</span>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5">
                  "{viewingTransaction?.description}"
                </p>
              </div>

              {/* INSTITUTIONAL METADATA - RECIPIENT & BANK DETAILS */}
              <div className="space-y-6 pt-4 pb-4">
                <div className="flex items-center gap-2 text-accent">
                  <ShieldAlert className="h-5 w-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Institutional Metadata (Verified Audit)</span>
                </div>
                
                {viewingTransaction?.metadata ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-8 rounded-3xl border border-accent/20">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Recipient Legal Name</Label>
                      <p className="text-sm font-black text-white">{viewingTransaction.metadata.recipientName || 'Unspecified'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Recipient Account Number</Label>
                      <p className="text-sm font-mono text-accent">{viewingTransaction.metadata.recipientAccount || 'Unspecified'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Routing / IBAN / SWIFT</Label>
                      <p className="text-sm font-mono text-white">{viewingTransaction.metadata.routingOrIban || 'Unspecified'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Settlement Protocol</Label>
                      <p className="text-sm font-black text-accent">{viewingTransaction.metadata.paymentMethod || 'Standard Transfer'}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2 pt-2 border-t border-white/5">
                      <Label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Receiving Institution</Label>
                      <p className="text-sm font-black text-white">{viewingTransaction.metadata.bankName || 'Unspecified'}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        {viewingTransaction.metadata.bankAddress || 'No address metadata on file.'}
                      </p>
                    </div>
                    {viewingTransaction.metadata.note && (
                      <div className="space-y-2 md:col-span-2 pt-2 border-t border-white/5">
                        <Label className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Internal Reference Note</Label>
                        <p className="text-xs text-slate-300 italic">"{viewingTransaction.metadata.note}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/5 text-center">
                    <p className="text-xs text-slate-500 italic uppercase font-black tracking-widest">No expanded metadata available for this settlement record.</p>
                  </div>
                )}
              </div>

              <div className="pt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                <span>Security Level: Tier-1 Institutional</span>
                <span>Verification: Nexa-Authenticated</span>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-6 bg-white/5 border-t border-white/10 shrink-0">
            <Button onClick={() => setViewingTransaction(null)} className="bg-primary hover:bg-primary/90 rounded-2xl w-full h-12 font-black uppercase tracking-widest text-xs">
              Dismiss Audit Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
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
              <Label>Settlement Type</Label>
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
            <Button onClick={handleUpdateTransaction} className="w-full rounded-xl h-11">Apply Ledger Correction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
