
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc, collection, serverTimestamp, query, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Trash2, Edit3, ShieldAlert, Loader2, Eye, Receipt, PlusCircle, Search, Clock, FileText, Send, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminTransactionsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [viewingTransaction, setViewingTransaction] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  // New Transaction Form State
  const [newTx, setNewTx] = useState({
    userId: "",
    accountId: "",
    description: "",
    amount: "",
    type: "deposit",
    status: "completed",
    currency: "USD",
    date: new Date().toISOString().slice(0, 16)
  });

  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

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

  const { data: allUsers } = useCollection(useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collection(db, "users");
  }, [db, isAdminReady]));

  const fetchAccountsForUser = async (userId: string) => {
    if (!db || !userId) return;
    setLoadingAccounts(true);
    try {
      const q = query(collection(db, "users", userId, "accounts"));
      const snapshot = await getDocs(q);
      const accounts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUserAccounts(accounts);
      if (accounts.length > 0) {
        setNewTx(prev => ({ ...prev, accountId: accounts[0].id }));
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Fetch Error", description: "Could not retrieve accounts for this user." });
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCreateTransaction = () => {
    if (!db || !newTx.userId || !newTx.accountId || !newTx.amount) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill all required fields." });
      return;
    }

    const txRef = collection(db, "users", newTx.userId, "accounts", newTx.accountId, "transactions");
    const amountVal = Number(newTx.amount);
    
    const transactionData = {
      accountId: newTx.accountId,
      customerId: newTx.userId,
      userId: newTx.userId,
      transactionType: newTx.type,
      amount: newTx.type === 'withdrawal' || newTx.type === 'transfer' ? -Math.abs(amountVal) : Math.abs(amountVal),
      currency: newTx.currency,
      description: newTx.description,
      status: newTx.status,
      transactionDate: new Date(newTx.date).toISOString(),
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(txRef, transactionData);
    
    // Also update account balance logic would normally go here, but for manual auditing 
    // we often just want to inject the record. We'll update the balance for consistency.
    const accountRef = doc(db, "users", newTx.userId, "accounts", newTx.accountId);
    const selectedAccount = userAccounts.find(a => a.id === newTx.accountId);
    if (selectedAccount) {
      updateDocumentNonBlocking(accountRef, {
        balance: selectedAccount.balance + (newTx.type === 'withdrawal' || newTx.type === 'transfer' ? -Math.abs(amountVal) : Math.abs(amountVal)),
        updatedAt: serverTimestamp()
      });
    }

    toast({ title: "Transaction Injected", description: "Audit trail record has been manually added." });
    setIsCreateDialogOpen(false);
    setNewTx({ userId: "", accountId: "", description: "", amount: "", type: "deposit", status: "completed", currency: "USD", date: new Date().toISOString().slice(0, 16) });
  };

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

  const handleDelete = (tx: any) => {
    if (!db) return;
    const path = `users/${tx.customerId || tx.userId}/accounts/${tx.accountId}/transactions/${tx.id}`;
    const docRef = doc(db, path);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Transaction Removed", description: "Record has been purged from the ledger." });
  };

  const filteredTransactions = transactions?.filter(tx => 
    tx.description?.toLowerCase().includes(search.toLowerCase()) || 
    (tx.customerId || tx.userId)?.toLowerCase().includes(search.toLowerCase())
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
            <p className="text-muted-foreground">Full authority to view, edit, and inject institutional financial movements.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter trail..." className="pl-10 h-11" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent h-11">
            <PlusCircle className="mr-2 h-4 w-4" /> Manual Entry
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institutional Settlement Ledger</CardTitle>
          <CardDescription>Auditing all financial movements across the network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableCell><Badge variant="secondary" className="capitalize text-[10px]">{tx.transactionType}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">{tx.status}</Badge>
                  </TableCell>
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

      {/* Manual Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Manual Ledger Entry</DialogTitle>
            <DialogDescription>Inject a new transaction record into a client account.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label>Target Client</Label>
              <Select value={newTx.userId} onValueChange={(val) => {
                setNewTx({...newTx, userId: val});
                fetchAccountsForUser(val);
              }}>
                <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                <SelectContent>
                  {allUsers?.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account Ledger</Label>
              <Select value={newTx.accountId} onValueChange={(val) => setNewTx({...newTx, accountId: val})} disabled={!newTx.userId || loadingAccounts}>
                <SelectTrigger><SelectValue placeholder={loadingAccounts ? "Loading..." : "Select Account"} /></SelectTrigger>
                <SelectContent>
                  {userAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.accountType} (...{acc.accountNumber.slice(-4)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={newTx.type} onValueChange={(val) => setNewTx({...newTx, type: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Institutional Deposit</SelectItem>
                  <SelectItem value="withdrawal">Regulatory Withdrawal</SelectItem>
                  <SelectItem value="transfer">System Transfer</SelectItem>
                  <SelectItem value="fee">Service Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Settlement Date</Label>
              <Input type="datetime-local" value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description / Memo</Label>
              <Input placeholder="Transaction reference..." value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTransaction} className="bg-primary px-8">Authorize Injection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle>Modify Transaction Record</DialogTitle>
            <DialogDescription>Performing authorized correction for record ID: {editingTransaction?.id}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editingTransaction?.description || ""} onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Amount (Positive or Negative)</Label>
              <Input type="number" step="0.01" value={editingTransaction?.amount || ""} onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Settlement Type</Label>
              <Select value={editingTransaction?.transactionType || "deposit"} onValueChange={(v) => setEditingTransaction({...editingTransaction, transactionType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audit Status</Label>
              <Select value={editingTransaction?.status || "completed"} onValueChange={(v) => setEditingTransaction({...editingTransaction, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Settled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTransaction} className="bg-accent">Commit Correction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detailed View Dialog */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-3xl p-0 border-none bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 bg-primary/20 border-b border-white/10">
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Receipt className="text-accent h-6 w-6" /> Audit Insight
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-mono text-xs">REF: {viewingTransaction?.id}</DialogDescription>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-500">Execution Date</span>
                <p className="text-lg font-bold">{viewingTransaction?.transactionDate ? new Date(viewingTransaction.transactionDate).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-500">Settlement Amount</span>
                <p className={`text-2xl font-black ${viewingTransaction?.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                  {viewingTransaction?.amount > 0 ? '+' : '-'}{formatCurrency(viewingTransaction?.amount || 0, viewingTransaction?.currency)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-500">Client UID</span>
                <p className="font-mono text-xs text-slate-300">{viewingTransaction?.customerId || viewingTransaction?.userId}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-500">Account ID</span>
                <p className="font-mono text-xs text-slate-300">{viewingTransaction?.accountId}</p>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10">
              <span className="text-[10px] uppercase font-black text-slate-500 block mb-2">Institutional Memo</span>
              <p className="italic text-slate-300">"{viewingTransaction?.description}"</p>
            </div>
          </div>
          <div className="p-6 bg-slate-900 border-t border-white/10 text-right">
            <Button onClick={() => setViewingTransaction(null)} className="bg-primary px-8 font-black uppercase text-xs tracking-widest">Close Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
