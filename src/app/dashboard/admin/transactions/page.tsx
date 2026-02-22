
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Loader2, 
  Eye, 
  Receipt, 
  PlusCircle, 
  Search, 
  Clock, 
  FileText, 
  Send, 
  Calendar as CalendarIcon,
  Building2,
  User as UserIcon,
  Globe,
  ArrowRightLeft,
  Info,
  X
} from "lucide-react";
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
    date: new Date().toISOString().slice(0, 16),
    recipientName: "",
    recipientAccount: "",
    routingOrIban: "",
    bankName: "",
    bankAddress: "",
    paymentMethod: "Online Transfer",
    note: ""
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
      metadata: {
        recipientName: newTx.recipientName,
        recipientAccount: newTx.recipientAccount,
        routingOrIban: newTx.routingOrIban,
        bankName: newTx.bankName,
        bankAddress: newTx.bankAddress,
        paymentMethod: newTx.paymentMethod,
        note: newTx.note
      },
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(txRef, transactionData);
    
    const accountRef = doc(db, "users", newTx.userId, "accounts", newTx.accountId);
    const selectedAccount = userAccounts.find(a => a.id === newTx.accountId);
    if (selectedAccount) {
      updateDocumentNonBlocking(accountRef, {
        balance: (selectedAccount.balance || 0) + (newTx.type === 'withdrawal' || newTx.type === 'transfer' ? -Math.abs(amountVal) : Math.abs(amountVal)),
        updatedAt: serverTimestamp()
      });
    }

    toast({ title: "Transaction Injected", description: "Audit trail record has been manually added." });
    setIsCreateDialogOpen(false);
    setNewTx({ 
      userId: "", accountId: "", description: "", amount: "", type: "deposit", status: "completed", 
      currency: "USD", date: new Date().toISOString().slice(0, 16),
      recipientName: "", recipientAccount: "", routingOrIban: "", bankName: "", bankAddress: "", 
      paymentMethod: "Online Transfer", note: ""
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(Math.abs(amount));
    } catch (e) {
      return `${currency} ${Math.abs(amount).toLocaleString()}`;
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
      metadata: {
        ...(editingTransaction.metadata || {}),
        recipientName: editingTransaction.metadata?.recipientName || "",
        recipientAccount: editingTransaction.metadata?.recipientAccount || "",
        routingOrIban: editingTransaction.metadata?.routingOrIban || "",
        bankName: editingTransaction.metadata?.bankName || "",
        bankAddress: editingTransaction.metadata?.bankAddress || "",
        paymentMethod: editingTransaction.metadata?.paymentMethod || "Online Transfer",
        note: editingTransaction.metadata?.note || ""
      }
    });
    
    toast({ title: "Transaction Updated", description: "Audit trail record and metadata have been modified." });
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
    (tx.customerId || tx.userId)?.toLowerCase().includes(search.toLowerCase()) ||
    tx.metadata?.recipientName?.toLowerCase().includes(search.toLowerCase())
  );

  if (isAdminRoleLoading && !isMasterAdmin) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdminConfirmed) {
    return <div className="text-center py-20 px-6"><ShieldAlert className="h-12 w-12 mx-auto text-red-500 mb-4" /><h2 className="text-2xl font-bold">Access Denied</h2><p className="text-sm text-muted-foreground">Administrative privileges required.</p></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-foreground pb-20 px-1">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Global Transaction Audit</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Authority to view, edit, and inject institutional financial movements.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter trail..." className="pl-10 h-11 border-slate-200" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent h-11 px-6 font-black uppercase tracking-tighter shadow-lg shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" /> Manual Entry
          </Button>
        </div>
      </div>

      <Card className="shadow-xl rounded-2xl border-none overflow-hidden">
        <CardHeader className="bg-white">
          <CardTitle className="text-lg">Institutional Settlement Ledger</CardTitle>
          <CardDescription>Auditing all financial movements across the network.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Client ID</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Description</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Type</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Status</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Amount</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTransactionsLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-20"><div className="flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /><span className="text-[10px] font-black uppercase text-slate-400">Syncing Network...</span></div></TableCell></TableRow>
                ) : filteredTransactions?.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">No transaction records matching your criteria were found.</TableCell></TableRow>
                ) : filteredTransactions?.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none">
                    <TableCell className="text-[10px] sm:text-xs font-mono py-4 px-6 whitespace-nowrap">{tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-[10px] sm:text-xs font-mono truncate max-w-[100px]">{tx.customerId || tx.userId}</TableCell>
                    <TableCell className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                      {tx.description}
                      {tx.metadata?.recipientName && <p className="text-[9px] text-muted-foreground">To: {tx.metadata.recipientName}</p>}
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize text-[9px] font-black tracking-tighter px-2">{tx.transactionType}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'outline'} className="text-[9px] font-black uppercase tracking-tighter px-2">{tx.status}</Badge>
                    </TableCell>
                    <TableCell className={`font-black whitespace-nowrap ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shrink-0" onClick={() => setViewingTransaction(tx)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 shrink-0" onClick={() => { setEditingTransaction({...tx}); setIsEditDialogOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 shrink-0" onClick={() => handleDelete(tx)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Dialog - Responsive Optimization */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl w-[95vw] sm:w-full flex flex-col">
          <div className="p-6 sm:p-8 bg-slate-50 border-b shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-black">Manual Ledger Entry</DialogTitle>
            <DialogDescription>Inject a new transaction record into a client account with full metadata.</DialogDescription>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <UserIcon className="h-4 w-4" /> Account Identification
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Target Client</Label>
                    <Select value={newTx.userId} onValueChange={(val) => {
                      setNewTx({...newTx, userId: val});
                      fetchAccountsForUser(val);
                    }}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select Client" /></SelectTrigger>
                      <SelectContent className="max-h-[250px]">
                        {allUsers?.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex flex-col items-start overflow-hidden">
                              <span className="font-bold truncate max-w-[200px]">{u.firstName} {u.lastName}</span>
                              <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[200px]">{u.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Account Ledger</Label>
                    <Select value={newTx.accountId} onValueChange={(val) => setNewTx({...newTx, accountId: val})} disabled={!newTx.userId || loadingAccounts}>
                      <SelectTrigger className="h-11"><SelectValue placeholder={loadingAccounts ? "Loading..." : "Select Account"} /></SelectTrigger>
                      <SelectContent>
                        {userAccounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.accountType} (...{acc.accountNumber.slice(-4)})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Settlement Parameters
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Transaction Type</Label>
                      <Select value={newTx.type} onValueChange={(val) => setNewTx({...newTx, type: val})}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="fee">Service Fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Status</Label>
                      <Select value={newTx.status} onValueChange={(val) => setNewTx({...newTx, status: val})}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Amount</Label>
                      <Input type="number" placeholder="0.00" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: e.target.value})} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Settlement Date</Label>
                      <Input type="datetime-local" value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})} className="h-11 text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Globe className="h-4 w-4" /> Recipient & Routing Metadata
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Recipient Name</Label>
                  <Input value={newTx.recipientName} onChange={(e) => setNewTx({...newTx, recipientName: e.target.value})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Recipient Account</Label>
                  <Input value={newTx.recipientAccount} onChange={(e) => setNewTx({...newTx, recipientAccount: e.target.value})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Routing / IBAN</Label>
                  <Input value={newTx.routingOrIban} onChange={(e) => setNewTx({...newTx, routingOrIban: e.target.value})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Bank Name</Label>
                  <Input value={newTx.bankName} onChange={(e) => setNewTx({...newTx, bankName: e.target.value})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Payment Method</Label>
                  <Select value={newTx.paymentMethod} onValueChange={(val) => setNewTx({...newTx, paymentMethod: val})}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                      <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                      <SelectItem value="ACH Settlement">ACH Settlement</SelectItem>
                      <SelectItem value="SWIFT International">SWIFT International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Memo</Label>
                  <Input value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})} placeholder="Public description" className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Internal Note (Optional)</Label>
                <Textarea value={newTx.note} onChange={(e) => setNewTx({...newTx, note: e.target.value})} className="min-h-[80px] rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 sm:p-8 bg-slate-50 border-t shrink-0 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 h-12 rounded-xl px-8 order-2 sm:order-1">Cancel</Button>
            <Button onClick={handleCreateTransaction} className="bg-primary h-12 rounded-xl px-10 font-black uppercase tracking-widest shadow-lg order-1 sm:order-2">Authorize Injection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog - Responsive Fixes */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl w-[95vw] sm:w-full flex flex-col">
          <div className="p-6 sm:p-8 bg-slate-50 border-b shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-black">Modify Transaction Record</DialogTitle>
            <DialogDescription className="text-xs truncate">Authorized correction for record ID: {editingTransaction?.id}</DialogDescription>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 border-b pb-2">Core Ledger Entry</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Amount</Label>
                    <Input type="number" step="0.01" value={editingTransaction?.amount || ""} onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Currency</Label>
                    <Input value={editingTransaction?.currency || "USD"} onChange={(e) => setEditingTransaction({...editingTransaction, currency: e.target.value})} className="h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Type</Label>
                    <Select value={editingTransaction?.transactionType || "deposit"} onValueChange={(v) => setEditingTransaction({...editingTransaction, transactionType: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="fee">Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Status</Label>
                    <Select value={editingTransaction?.status || "completed"} onValueChange={(v) => setEditingTransaction({...editingTransaction, status: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Settlement Date</Label>
                  <Input type="datetime-local" value={editingTransaction?.transactionDate ? new Date(editingTransaction.transactionDate).toISOString().slice(0, 16) : ""} onChange={(e) => setEditingTransaction({...editingTransaction, transactionDate: new Date(e.target.value).toISOString()})} className="h-11 text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Public Description</Label>
                  <Input value={editingTransaction?.description || ""} onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})} className="h-11" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 border-b pb-2">Metadata Override</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Recipient Name</Label>
                    <Input value={editingTransaction?.metadata?.recipientName || ""} onChange={(e) => setEditingTransaction({...editingTransaction, metadata: {...editingTransaction.metadata, recipientName: e.target.value}})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Recipient Account</Label>
                    <Input value={editingTransaction?.metadata?.recipientAccount || ""} onChange={(e) => setEditingTransaction({...editingTransaction, metadata: {...editingTransaction.metadata, recipientAccount: e.target.value}})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Routing / IBAN</Label>
                    <Input value={editingTransaction?.metadata?.routingOrIban || ""} onChange={(e) => setEditingTransaction({...editingTransaction, metadata: {...editingTransaction.metadata, routingOrIban: e.target.value}})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Bank Name</Label>
                    <Input value={editingTransaction?.metadata?.bankName || ""} onChange={(e) => setEditingTransaction({...editingTransaction, metadata: {...editingTransaction.metadata, bankName: e.target.value}})} className="h-11" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Payment Method</Label>
                  <Select value={editingTransaction?.metadata?.paymentMethod || "Online Transfer"} onValueChange={(v) => setEditingTransaction({...editingTransaction, metadata: {...editingTransaction.metadata, paymentMethod: v}})}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                      <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                      <SelectItem value="ACH Settlement">ACH Settlement</SelectItem>
                      <SelectItem value="SWIFT International">SWIFT International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Internal Note</Label>
                  <Input value={editingTransaction?.metadata?.note || ""} onChange={(e) => setEditingTransaction({...editingTransaction, metadata: {...editingTransaction.metadata, note: e.target.value}})} className="h-11" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 sm:p-8 bg-slate-50 border-t shrink-0 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-12 rounded-xl px-8 order-2 sm:order-1">Cancel</Button>
            <Button onClick={handleUpdateTransaction} className="bg-accent h-12 rounded-xl px-10 font-black uppercase tracking-widest order-1 sm:order-2 shadow-lg">Commit Correction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-Page Audit Insight Dossier - Responsive Fixes */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent shadow-none w-[95vw] sm:w-full">
          <div className="bg-[#E5E7EB] rounded-3xl p-6 sm:p-12 shadow-2xl border border-slate-300 relative">
            <button onClick={() => setViewingTransaction(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 z-10">
              <X className="h-6 w-6" />
            </button>
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="relative inline-block">
                  <DialogTitle className="text-2xl sm:text-3xl font-black text-[#002B5B] tracking-tight uppercase">Audit Insight</DialogTitle>
                  <div className="absolute -bottom-2 left-0 h-1.5 w-24 bg-[#2563EB]" />
                </div>
                <div className="text-left sm:text-right">
                  <Badge className="bg-[#002B5B] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">{viewingTransaction?.status || 'Completed'}</Badge>
                  <p className="text-[10px] font-mono text-slate-500 mt-2 break-all">REF: {viewingTransaction?.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <Receipt className="h-4 w-4" /> Settlement Overview
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-500">Amount</span>
                        <span className={`text-2xl sm:text-3xl font-black break-all ${viewingTransaction?.amount > 0 ? 'text-green-600' : 'text-[#002B5B]'}`}>
                          {viewingTransaction?.amount > 0 ? '+' : '-'}{formatCurrency(viewingTransaction?.amount || 0, viewingTransaction?.currency)}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Execution Date</p>
                          <p className="font-bold text-slate-700">{viewingTransaction?.transactionDate ? new Date(viewingTransaction.transactionDate).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Settlement Type</p>
                          <p className="font-bold text-slate-700 capitalize">{viewingTransaction?.transactionType}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <UserIcon className="h-4 w-4" /> Client Information
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-3 text-xs sm:text-sm">
                      <div className="flex flex-col sm:flex-row justify-between gap-1">
                        <span className="text-slate-500 font-bold shrink-0">Client UID:</span>
                        <span className="font-mono text-[10px] sm:text-xs break-all">{viewingTransaction?.customerId || viewingTransaction?.userId}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between gap-1">
                        <span className="text-slate-500 font-bold shrink-0">Source Account:</span>
                        <span className="font-mono text-[10px] sm:text-xs break-all">{viewingTransaction?.accountId}</span>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Routing & Metadata
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-4 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Recipient Account</p>
                        <p className="font-bold text-slate-700 break-words">{viewingTransaction?.metadata?.recipientName || 'Institutional Internal'}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-mono break-all">{viewingTransaction?.metadata?.recipientAccount || '—'}</p>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Bank / Institution</p>
                          <p className="font-bold text-slate-700 break-words">{viewingTransaction?.metadata?.bankName || 'Nexa International'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Payment Method</p>
                          <p className="font-bold text-slate-700">{viewingTransaction?.metadata?.paymentMethod || 'System Rail'}</p>
                        </div>
                      </div>
                      {viewingTransaction?.metadata?.routingOrIban && (
                        <div className="space-y-1 pt-2 border-t border-slate-200/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Routing / IBAN</p>
                          <p className="font-mono text-[10px] sm:text-xs font-bold text-slate-700 break-all">{viewingTransaction.metadata.routingOrIban}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <Info className="h-4 w-4" /> Regulatory Memos
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-4 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Public Description</p>
                        <p className="italic text-slate-600 break-words">"{viewingTransaction?.description}"</p>
                      </div>
                      {viewingTransaction?.metadata?.note && (
                        <div className="space-y-1 pt-2 border-t border-slate-200">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Internal Note</p>
                          <p className="text-slate-600 break-words">{viewingTransaction.metadata.note}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-300">
                <Button onClick={() => setViewingTransaction(null)} className="w-full h-14 rounded-2xl font-black bg-[#002B5B] hover:bg-[#003B7B] shadow-xl text-base sm:text-lg uppercase tracking-widest transition-all hover:scale-[1.01]">
                  Close Audit Insight
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
