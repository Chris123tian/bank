
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc, serverTimestamp, collection, query, where } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Landmark, 
  ShieldAlert, 
  Loader2, 
  Trash2, 
  PlusCircle, 
  Eye, 
  Search, 
  TrendingUp,
  X,
  User as UserIcon,
  Briefcase,
  MapPin,
  ShieldCheck,
  CreditCard,
  DollarSign,
  AlertCircle,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminAccountsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [viewingClientPortfolio, setViewingClientPortfolio] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newAccount, setNewAccount] = useState({
    userId: "",
    accountType: "Current Account",
    balance: "1000",
    currency: "USD",
    transactionCode: Math.floor(100000 + Math.random() * 900000).toString()
  });

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isMasterAdmin = user?.email === "info@citybankglobal.com";
  const isAdminConfirmed = isMasterAdmin || !!adminRole;

  /**
   * ADMIN FLOW ARCHITECTURE:
   * Utilizing broad collectionGroup query for all verified administrators.
   * This resolves index-level permission conflicts.
   */
  const accountsRef = useMemoFirebase(() => {
    if (!db || !isAdminConfirmed) return null;
    return collectionGroup(db, "accounts");
  }, [db, isAdminConfirmed]);

  const { data: accounts, isLoading: isAccountsLoading } = useCollection(accountsRef);

  const usersRef = useMemoFirebase(() => {
    if (!db || !isAdminConfirmed) return null;
    return collection(db, "users");
  }, [db, isAdminConfirmed]);

  const { data: allUsers } = useCollection(usersRef);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  const handleCreateAccount = () => {
    if (!db || !newAccount.userId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please select a target client." });
      return;
    }

    const colRef = collection(db, "users", newAccount.userId, "accounts");
    const accountData = {
      accountNumber: `CITY-${Math.floor(10000000 + Math.random() * 90000000)}`,
      accountType: newAccount.accountType,
      balance: Number(newAccount.balance),
      currency: newAccount.currency || "USD",
      transactionCode: newAccount.transactionCode || Math.floor(100000 + Math.random() * 900000).toString(),
      userId: newAccount.userId,
      customerId: newAccount.userId,
      status: "Active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(colRef, accountData);
    toast({ title: "Account Initialized", description: "Capital has been successfully injected into the new client account." });
    setIsCreateDialogOpen(false);
    setNewAccount({ userId: "", accountType: "Current Account", balance: "1000", currency: "USD", transactionCode: Math.floor(100000 + Math.random() * 900000).toString() });
  };

  const handleUpdateAccount = () => {
    if (!editingAccount || !db) return;
    const clientUid = editingAccount.customerId || editingAccount.userId;
    const docRef = doc(db, "users", clientUid, "accounts", editingAccount.id);
    
    updateDocumentNonBlocking(docRef, {
      accountType: editingAccount.accountType,
      balance: Number(editingAccount.balance),
      currency: editingAccount.currency || "USD",
      transactionCode: editingAccount.transactionCode || "000000",
      status: editingAccount.status || "Active",
      updatedAt: serverTimestamp(),
    });

    toast({ title: "Ledger Corrected", description: `Financial records for ${editingAccount.accountNumber} updated.` });
    setEditingAccount(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteAccount = (acc: any) => {
    if (!db) return;
    const docRef = doc(db, "users", acc.customerId || acc.userId, "accounts", acc.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Account Terminated", description: "The account record has been permanently removed." });
  };

  const filteredAccounts = accounts?.filter(acc => 
    acc.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.customerId || acc.userId)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = viewingClientPortfolio ? allUsers?.find(u => u.id === (viewingClientPortfolio.customerId || viewingClientPortfolio.userId)) : null;

  if (isAdminRoleLoading && !isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying Clearance...</p>
      </div>
    );
  }

  if (!isAdminConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold text-primary">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-xs">Institutional administrative credentials are required to access this terminal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-1">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Landmark className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Global Asset Audit</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Full oversight and balance management across the network.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Client or Account..." 
              className="pl-10 h-11 border-slate-200" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent h-11 px-6 font-black uppercase tracking-tighter shadow-lg shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" /> Open Account
          </Button>
        </div>
      </div>

      <Card className="shadow-xl rounded-2xl overflow-hidden border-none bg-white">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg">Institutional Asset Ledger</CardTitle>
          <CardDescription>Auditing all capital holdings within the City Bank Global ecosystem.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Account #</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Client Identity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Type</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Verified Balance</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Status</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAccountsLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20"><div className="flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /><span className="text-[10px] font-black uppercase text-slate-400">Syncing Assets...</span></div></TableCell></TableRow>
                ) : filteredAccounts?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No accounts found.</TableCell></TableRow>
                ) : filteredAccounts?.map((acc) => (
                  <TableRow key={acc.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none">
                    <TableCell className="font-mono text-[10px] sm:text-xs font-bold text-primary py-4 px-6">{acc.accountNumber}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 truncate max-w-[120px] sm:max-w-[150px]">{acc.customerId || acc.userId}</span>
                        <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Client Record</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black border-primary/20 uppercase tracking-tighter px-2">{acc.accountType}</Badge>
                    </TableCell>
                    <TableCell className="font-black text-primary text-sm sm:text-base whitespace-nowrap">
                      {formatCurrency(acc.balance || 0, acc.currency || 'USD')}
                    </TableCell>
                    <TableCell>
                      <Badge className={acc.status === 'Suspended' ? 'bg-red-100 text-red-700 border-none text-[9px] font-black uppercase' : 'bg-green-100 text-green-700 border-none text-[9px] font-black uppercase'}>
                        {acc.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-primary hover:bg-primary/5 shrink-0"
                          onClick={() => setViewingClientPortfolio(acc)}
                          title="View Institutional Dossier"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-accent hover:bg-accent/5 shrink-0"
                          onClick={() => {
                            setEditingAccount({
                              ...acc,
                              balance: acc.balance ?? 0,
                              currency: acc.currency ?? "USD",
                              accountType: acc.accountType ?? "Current Account",
                              status: acc.status ?? "Active",
                              transactionCode: acc.transactionCode ?? "000000"
                            });
                            setIsEditDialogOpen(true);
                          }}
                          title="Adjust Capital / Edit"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:bg-red-50 shrink-0" onClick={() => handleDeleteAccount(acc)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl p-0 border-none rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col w-[95vw] sm:w-full">
          <div className="p-6 sm:p-8 bg-[#002B5B] text-white shrink-0">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl shrink-0"><TrendingUp className="h-6 w-6" /></div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight">Capital Adjustment</DialogTitle>
                  <DialogDescription className="text-white/60 text-xs">Authorized regulatory correction for asset: {editingAccount?.accountNumber}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
            {editingAccount && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Adjusted Balance</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        type="number" 
                        value={editingAccount.balance} 
                        onChange={(e) => setEditingAccount({...editingAccount, balance: e.target.value})}
                        className="h-12 pl-10 text-lg font-black"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Asset Currency</Label>
                    <Select value={editingAccount.currency} onValueChange={(v) => setEditingAccount({...editingAccount, currency: v})}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Account Type</Label>
                    <Select value={editingAccount.accountType} onValueChange={(v) => setEditingAccount({...editingAccount, accountType: v})}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Current Account">Current Account</SelectItem>
                        <SelectItem value="Savings Account">Savings Account</SelectItem>
                        <SelectItem value="Business Account">Business Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Operational Status</Label>
                    <Select value={editingAccount.status} onValueChange={(v) => setEditingAccount({...editingAccount, status: v})}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Locked">Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Transaction Authorization Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      value={editingAccount.transactionCode} 
                      onChange={(e) => setEditingAccount({...editingAccount, transactionCode: e.target.value})}
                      className="h-12 pl-10 font-mono font-black tracking-widest"
                      placeholder="6-digit authorization code"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">This code is required for all outgoing transfers from this account.</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 sm:p-8 bg-slate-50 border-t flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold order-2 sm:order-1">Cancel</Button>
            <Button onClick={handleUpdateAccount} className="flex-1 h-12 bg-[#002B5B] hover:bg-[#003B7B] rounded-xl font-black uppercase tracking-widest shadow-lg order-1 sm:order-2">Commit Corrections</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl p-0 border-none rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col w-[95vw] sm:w-full">
          <div className="p-6 sm:p-8 bg-primary text-white shrink-0">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl shrink-0"><PlusCircle className="h-6 w-6" /></div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight">Open Institutional Account</DialogTitle>
                  <DialogDescription className="text-white/60 text-xs sm:text-sm">Provisioning a new financial asset.</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Target Client</Label>
                <Select value={newAccount.userId} onValueChange={(v) => setNewAccount({...newAccount, userId: v})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select verified client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers?.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select value={newAccount.accountType} onValueChange={(v) => setNewAccount({...newAccount, accountType: v})}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Current Account">Current Account</SelectItem>
                      <SelectItem value="Savings Account">Savings Account</SelectItem>
                      <SelectItem value="Business Account">Business Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={newAccount.currency} onValueChange={(v) => setNewAccount({...newAccount, currency: v})}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Initial Deposit</Label>
                  <Input 
                    type="number" 
                    value={newAccount.balance} 
                    onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                    className="h-12 text-lg font-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auth Code</Label>
                  <Input 
                    value={newAccount.transactionCode} 
                    onChange={(e) => setNewAccount({...newAccount, transactionCode: e.target.value})}
                    className="h-12 font-mono font-black tracking-widest"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 sm:p-8 bg-slate-50 border-t flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold order-2 sm:order-1">Cancel</Button>
            <Button onClick={handleCreateAccount} className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest shadow-lg order-1 sm:order-2">Initialize Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingClientPortfolio} onOpenChange={() => setViewingClientPortfolio(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent shadow-none w-[95vw] sm:w-full">
          <div className="bg-[#E5E7EB] rounded-3xl p-6 sm:p-12 shadow-2xl border border-slate-300 relative">
            <button onClick={() => setViewingClientPortfolio(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 z-10">
              <X className="h-6 w-6" />
            </button>
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="relative inline-block">
                <DialogHeader>
                  <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#002B5B] tracking-tight uppercase">Institutional Dossier</DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs mt-2">Comprehensive financial breakdown.</DialogDescription>
                </DialogHeader>
                <div className="absolute -bottom-2 left-0 h-1.5 w-20 bg-[#2563EB]" />
              </div>
              
              {viewingClientPortfolio && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-slate-300">
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> Legal Identification
                      </h4>
                      <div className="space-y-3 text-slate-700">
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Legal Name:</span>
                          <span className="font-medium">{selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Institutional Email:</span>
                          <span className="font-medium text-xs font-mono">{selectedClient?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Phone Number:</span>
                          <span className="font-medium">{selectedClient?.phoneNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">SSN / Tax ID:</span>
                          <span className="font-mono text-xs">{selectedClient?.ssn ? `***-**-${selectedClient.ssn.slice(-4)}` : 'N/A'}</span>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Employment Dossier
                      </h4>
                      <div className="space-y-3 text-slate-700">
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Status:</span>
                          <div className="inline-flex"><Badge variant="secondary" className="text-[9px] font-black px-2">{selectedClient?.employmentStatus || 'N/A'}</Badge></div>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Employer:</span>
                          <span className="font-medium">{selectedClient?.employerName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Annual Income:</span>
                          <span className="font-black text-primary">${selectedClient?.annualIncome?.toLocaleString() || '0.00'}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-slate-300">
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Residential Metadata
                      </h4>
                      <div className="p-4 bg-white/50 rounded-xl border border-slate-300 space-y-2 text-sm text-slate-700">
                        <div className="font-bold text-[#002B5B]">{selectedClient?.addressLine1 || 'No address on file'}</div>
                        <div>
                          {selectedClient?.city ? `${selectedClient.city}, ${selectedClient.state} ${selectedClient.postalCode}` : 'N/A'}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Asset Details
                      </h4>
                      <div className="space-y-3 text-slate-700">
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Asset Type:</span>
                          <div className="inline-flex"><Badge variant="outline" className="text-[9px] font-black px-2">{viewingClientPortfolio.accountType}</Badge></div>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Verified Balance:</span>
                          <span className="font-black text-primary text-lg">{formatCurrency(viewingClientPortfolio.balance, viewingClientPortfolio.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-1">
                          <span className="font-black text-[#002B5B]">Authorization Code:</span>
                          <span className="font-mono font-black text-accent">{viewingClientPortfolio.transactionCode || 'NOT SET'}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-300">
                <Button onClick={() => setViewingClientPortfolio(null)} className="w-full h-14 rounded-2xl font-bold bg-[#002B5B] hover:bg-[#003B7B] shadow-xl text-lg uppercase tracking-wider">Dismiss Dossier</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
