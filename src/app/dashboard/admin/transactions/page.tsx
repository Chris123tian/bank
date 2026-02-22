
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
import { Trash2, Edit3, ShieldAlert, Loader2, Eye, Receipt, User, Landmark, Send, Search, Clock, FileText, Separator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdminConfirmed) {
    return <div className="text-center py-20"><ShieldAlert className="h-12 w-12 mx-auto text-red-500 mb-4" /><h2 className="text-2xl font-bold">Access Denied</h2></div>;
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
          <Input placeholder="Search audit trail..." className="pl-10 h-11" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <TableCell><Badge variant="secondary" className="capitalize text-[10px]">{tx.transactionType || "Other"}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{tx.status}</Badge></TableCell>
                  <TableCell className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewingTransaction(tx)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => { setEditingTransaction({...tx}); setIsEditDialogOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(tx)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Insight Dialog - Wide One-Page Layout */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-4xl p-0 border-none bg-slate-950 text-white rounded-3xl overflow-hidden">
          <div className="p-8 bg-primary/20 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${viewingTransaction?.amount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black">Audit Insight</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs font-mono">Reference ID: {viewingTransaction?.id}</DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500">Asset Settlement</Label>
                <p className={`text-3xl font-black ${viewingTransaction?.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                  {viewingTransaction?.amount > 0 ? '+' : '-'}{formatCurrency(viewingTransaction?.amount || 0, viewingTransaction?.currency || 'USD')}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500">Timestamp</Label>
                <p className="text-lg font-bold">{viewingTransaction?.transactionDate ? new Date(viewingTransaction.transactionDate).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-slate-500">Client UID</span>
                  <span className="text-[10px] font-mono break-all">{viewingTransaction?.customerId || viewingTransaction?.userId}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-slate-500">Account Ledger ID</span>
                  <span className="text-[10px] font-mono break-all">{viewingTransaction?.accountId}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <Label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Institutional Metadata (Client Input)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-accent uppercase">Recipient Name</span>
                    <p className="text-sm font-bold">{viewingTransaction?.metadata?.recipientName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-accent uppercase">Recipient Account</span>
                    <p className="text-sm font-mono">{viewingTransaction?.metadata?.recipientAccount || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-accent uppercase">Routing / IBAN</span>
                    <p className="text-sm font-mono">{viewingTransaction?.metadata?.routingOrIban || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-accent uppercase">Protocol</span>
                    <p className="text-sm font-bold">{viewingTransaction?.metadata?.paymentMethod || 'N/A'}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[9px] font-bold text-accent uppercase">Bank Identity</span>
                    <p className="text-sm font-bold">{viewingTransaction?.metadata?.bankName || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400">{viewingTransaction?.metadata?.bankAddress || 'N/A'}</p>
                  </div>
                  {viewingTransaction?.metadata?.note && (
                    <div className="space-y-1 col-span-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-bold text-accent uppercase">Reference Note</span>
                      <p className="text-xs text-slate-300 italic">"{viewingTransaction.metadata.note}"</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500">Public Memo</Label>
                <p className="text-sm bg-white/5 p-4 rounded-xl border border-white/5 italic">"{viewingTransaction?.description}"</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white/5 border-t border-white/10">
            <Button onClick={() => setViewingTransaction(null)} className="bg-primary w-full h-12 font-black uppercase tracking-widest text-xs">Dismiss Audit Record</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Unified Wide Layout */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 bg-slate-50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Edit3 className="h-5 w-5" /></div>
              <div>
                <DialogTitle className="text-xl font-bold">Correction Form</DialogTitle>
                <DialogDescription>Adjusting ledger entry ID: {editingTransaction?.id}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Execution Date</Label>
                <Input type="datetime-local" className="h-11" value={editingTransaction?.transactionDate?.slice(0, 16) ?? ""} onChange={(e) => setEditingTransaction({...editingTransaction, transactionDate: new Date(e.target.value).toISOString()})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Settlement Type</Label>
                <Select value={editingTransaction?.transactionType ?? "withdrawal"} onValueChange={(v) => setEditingTransaction({...editingTransaction, transactionType: v})}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="bill_payment">Bill Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Amount</Label>
                <Input type="number" step="0.01" className="h-11 font-bold" value={editingTransaction?.amount ?? ""} onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Public Memo</Label>
                <Input className="h-11" value={editingTransaction?.description ?? ""} onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Audit Status</Label>
                <Select value={editingTransaction?.status ?? "pending"} onValueChange={(v) => setEditingTransaction({...editingTransaction, status: v})}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Settled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Currency</Label>
                <Select value={editingTransaction?.currency ?? "USD"} onValueChange={(v) => setEditingTransaction({...editingTransaction, currency: v})}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl h-12 flex-1">Cancel Audit</Button>
            <Button onClick={handleUpdateTransaction} className="bg-primary rounded-xl h-12 flex-1 font-bold">Apply Correction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
