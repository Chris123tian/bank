"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc, collection, serverTimestamp, query, getDocs } from "firebase/firestore";
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
import { 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Loader2, 
  Eye, 
  Receipt, 
  PlusCircle, 
  Search, 
  Globe, 
  User as UserIcon,
  X,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { format } from "date-fns";

export default function AdminTransactionsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [viewingTransaction, setViewingTransaction] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  /**
   * REGULATORY AUDIT ACCESS:
   * Only the Master Admin can perform a global collectionGroup audit.
   * Other admins should audit via specific user profiles to satisfy query safety rules.
   */
  const transactionsRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    if (!isMasterAdmin) return null; // Standard admins must audit via user profiles
    return collectionGroup(db, "transactions");
  }, [db, isAdminReady, isMasterAdmin]);

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
    const clientUid = editingTransaction.customerId || editingTransaction.userId;
    const docRef = doc(db, "users", clientUid, "accounts", editingTransaction.accountId, "transactions", editingTransaction.id);
    
    const finalDate = editingTransaction.transactionDate && editingTransaction.transactionDate.length === 16 
      ? new Date(editingTransaction.transactionDate).toISOString() 
      : editingTransaction.transactionDate;

    updateDocumentNonBlocking(docRef, {
      description: editingTransaction.description ?? "",
      amount: Number(editingTransaction.amount) || 0,
      status: editingTransaction.status ?? "pending",
      transactionDate: finalDate,
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
    const clientUid = tx.customerId || tx.userId;
    const docRef = doc(db, "users", clientUid, "accounts", tx.accountId, "transactions", tx.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Transaction Removed", description: "Record has been purged from the ledger." });
  };

  const filteredTransactions = transactions?.filter(tx => 
    tx.description?.toLowerCase().includes(search.toLowerCase()) || 
    (tx.customerId || tx.userId)?.toLowerCase().includes(search.toLowerCase()) ||
    tx.metadata?.recipientName?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
    const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
    return dateB - dateA;
  });

  if (isAdminRoleLoading && !isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying Administrative Clearance...</div>
      </div>
    );
  }

  if (!isAdminConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold text-primary">Access Denied</h2>
        <div className="text-muted-foreground text-sm max-w-xs">Institutional administrative credentials are required to access this terminal.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-1 pb-20">
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

      {!isMasterAdmin ? (
        <Card className="p-12 text-center space-y-4 border-dashed border-2 bg-slate-50/50 rounded-3xl">
          <ShieldAlert className="h-12 w-12 text-orange-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary">Master Clearance Required</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Global collection group auditing is reserved for the Master Administrative terminal. Please use the User Audit terminal to manage specific client portfolios and transaction logs.
            </p>
          </div>
          <Button variant="outline" asChild className="font-bold">
            <a href="/dashboard/admin/users">Go to User Audit</a>
          </Button>
        </Card>
      ) : (
        <Card className="shadow-xl rounded-2xl border-none overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg">Institutional Settlement Ledger</CardTitle>
            <CardDescription>Auditing all financial movements across the City Bank Global network.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
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
                    <TableRow><TableCell colSpan={7} className="text-center py-24"><div className="flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /><div className="text-[10px] font-black uppercase text-slate-400">Syncing Network Ledger...</div></div></TableCell></TableRow>
                  ) : filteredTransactions?.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-24 text-muted-foreground italic">No transaction records found.</TableCell></TableRow>
                  ) : filteredTransactions?.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none">
                      <TableCell className="text-[10px] sm:text-xs font-mono py-4 px-6 whitespace-nowrap">{tx.transactionDate ? format(new Date(tx.transactionDate), "MMM dd, yyyy HH:mm") : 'N/A'}</TableCell>
                      <TableCell className="text-[10px] sm:text-xs font-mono truncate max-w-[100px]">{tx.customerId || tx.userId}</TableCell>
                      <TableCell className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="truncate">{tx.description}</span>
                          {tx.metadata?.recipientName && <span className="text-[9px] text-muted-foreground uppercase font-bold">To: {tx.metadata.recipientName}</span>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize text-[9px] font-black tracking-tighter px-2">{tx.transactionType}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'outline'} className="text-[9px] font-black uppercase tracking-tighter px-2">{tx.status}</Badge>
                      </TableCell>
                      <TableCell className={`font-black whitespace-nowrap ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency || 'USD')}
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shrink-0" onClick={() => setViewingTransaction(tx)}><Eye className="h-4 w-4" /></Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 shrink-0" 
                            onClick={() => { 
                              const dateStr = tx.transactionDate ? new Date(tx.transactionDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);
                              setEditingTransaction({...tx, transactionDate: dateStr}); 
                              setIsEditDialogOpen(true); 
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
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
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl w-[95vw] sm:w-full flex flex-col">
          <div className="p-6 sm:p-8 bg-primary text-white border-b shrink-0">
            <DialogHeader>
              <DialogTitle>Manual Ledger Entry</DialogTitle>
              <DialogDescription className="text-white/60 text-xs sm:text-sm">Inject a new transaction record into a client account with full metadata for regulatory auditing.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-2 tracking-widest">Target Account</h4>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Verified Client</Label>
                  <Select value={newTx.userId} onValueChange={(v) => { setNewTx({...newTx, userId: v}); fetchAccountsForUser(v); }}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select verified client..." /></SelectTrigger>
                    <SelectContent>
                      {allUsers?.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Asset Selection</Label>
                  <Select value={newTx.accountId} onValueChange={(v) => setNewTx({...newTx, accountId: v})} disabled={!newTx.userId || loadingAccounts}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={loadingAccounts ? "Syncing..." : "Select account..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {userAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.accountType} (...{acc.accountNumber?.slice(-4)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-2 tracking-widest">Movement Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Type</Label>
                    <Select value={newTx.type} onValueChange={(v) => setNewTx({...newTx, type: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deposit">Deposit (Credit)</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal (Debit)</SelectItem>
                        <SelectItem value="transfer">Transfer (Internal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Status</Label>
                    <Select value={newTx.status} onValueChange={(v) => setNewTx({...newTx, status: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending Audit</SelectItem>
                        <SelectItem value="failed">Failed / Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Date & Time</Label>
                  <Input type="datetime-local" value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Capital Amount (USD)</Label>
                  <Input type="number" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: e.target.value})} className="h-11 text-lg font-black" />
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Memo / Description</Label>
              <Input value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})} placeholder="Regulatory note for the ledger..." className="h-11" />
            </div>
          </div>
          <DialogFooter className="p-6 sm:p-8 bg-slate-50 border-t shrink-0 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 h-12 rounded-xl px-8 order-2 sm:order-1">Cancel</Button>
            <Button onClick={handleCreateTransaction} className="bg-primary h-12 rounded-xl px-10 font-black uppercase tracking-widest shadow-lg order-1 sm:order-2">Authorize Injection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl w-[95vw] sm:w-full flex flex-col">
          <div className="p-6 sm:p-8 bg-accent text-white border-b shrink-0">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl"><Edit3 className="h-6 w-6" /></div>
                <div>
                  <DialogTitle>Modify Transaction Record</DialogTitle>
                  <DialogDescription className="text-white/60 text-xs sm:text-sm">Authorized correction for regulatory audit record ID: {editingTransaction?.id}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            {editingTransaction && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Description</Label>
                    <Input value={editingTransaction.description} onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Asset Amount</Label>
                    <Input type="number" value={editingTransaction.amount} onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})} className="h-11 font-black" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Execution Date & Time</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="datetime-local" 
                        value={editingTransaction.transactionDate} 
                        onChange={(e) => setEditingTransaction({...editingTransaction, transactionDate: e.target.value})} 
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Execution Status</Label>
                    <Select value={editingTransaction.status} onValueChange={(v) => setEditingTransaction({...editingTransaction, status: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Counterparty Name</Label>
                    <Input 
                      value={editingTransaction.metadata?.recipientName || ""} 
                      onChange={(e) => setEditingTransaction({...editingTransaction, metadata: {...(editingTransaction.metadata || {}), recipientName: e.target.value}})} 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Settlement Currency</Label>
                    <Select value={editingTransaction.currency} onValueChange={(v) => setEditingTransaction({...editingTransaction, currency: v})}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 sm:p-8 bg-slate-50 border-t shrink-0 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-12 rounded-xl px-8 order-2 sm:order-1">Cancel</Button>
            <Button onClick={handleUpdateTransaction} className="bg-accent h-12 rounded-xl px-10 font-black uppercase tracking-widest order-1 sm:order-2 shadow-lg">Commit Correction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent shadow-none w-[95vw] sm:w-full">
          <div className="bg-[#E5E7EB] rounded-3xl p-6 sm:p-12 shadow-2xl border border-slate-300 relative">
            <button onClick={() => setViewingTransaction(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 z-10">
              <X className="h-6 w-6" />
            </button>
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="relative inline-block">
                  <DialogHeader>
                    <DialogTitle className="text-2xl sm:text-3xl font-black text-[#002B5B] tracking-tight uppercase">Audit Insight</DialogTitle>
                    <DialogDescription className="text-[10px] font-mono text-slate-500 mt-2 break-all">Comprehensive movement dossier for transaction: {viewingTransaction?.id}</DialogDescription>
                  </DialogHeader>
                  <div className="absolute -bottom-2 left-0 h-1.5 w-24 bg-[#2563EB]" />
                </div>
                <div className="text-left sm:text-right">
                  <Badge className="bg-[#002B5B] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">{viewingTransaction?.status || 'Completed'}</Badge>
                </div>
              </div>
              
              {viewingTransaction && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-300">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Receipt className="h-4 w-4" /> Settlement Breakdown
                    </h4>
                    <div className="space-y-3 text-slate-700 bg-white/50 p-4 rounded-xl">
                      <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                        <span className="font-black text-[#002B5B]">Amount:</span>
                        <span className={`font-black text-lg ${viewingTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(viewingTransaction.amount, viewingTransaction.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                        <span className="font-black text-[#002B5B]">Execution Date:</span>
                        <span className="font-medium">{viewingTransaction.transactionDate ? format(new Date(viewingTransaction.transactionDate), "PPP p") : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                        <span className="font-black text-[#002B5B]">Movement Type:</span>
                        <div className="inline-flex"><Badge variant="outline" className="text-[9px] font-black uppercase">{viewingTransaction.transactionType}</Badge></div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Counterparty Dossier
                    </h4>
                    <div className="space-y-3 text-slate-700 bg-white/50 p-4 rounded-xl">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-slate-400 uppercase">Entity Identity</div>
                        <div className="font-bold text-[#002B5B]">{viewingTransaction.metadata?.recipientName || 'Internal Ledger'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-slate-400 uppercase">Settlement Rail</div>
                        <div className="font-bold text-[#002B5B]">{viewingTransaction.metadata?.paymentMethod || 'Online Transfer'}</div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

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