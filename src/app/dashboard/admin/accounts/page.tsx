
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc, serverTimestamp, collection } from "firebase/firestore";
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
  Edit3, 
  Trash2, 
  PlusCircle, 
  Eye, 
  Search, 
  User as UserIcon,
  Briefcase,
  MapPin,
  ShieldCheck,
  FileText,
  CreditCard,
  Lock,
  ArrowRightLeft,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminAccountsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [viewingClientPortfolio, setViewingClientPortfolio] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create Form State
  const [newAccount, setNewAccount] = useState({
    userId: "",
    accountType: "Current Account",
    balance: "1000",
    currency: "USD"
  });

  // Verify Admin Status
  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isMasterAdmin = user?.email === "citybank@gmail.com";
  const isAdminConfirmed = isMasterAdmin || (!!adminRole && !isAdminRoleLoading);
  const isAdminReady = isMasterAdmin || (!isAdminRoleLoading && isAdminConfirmed);

  // Global Accounts Collection
  const accountsRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collectionGroup(db, "accounts");
  }, [db, isAdminReady]);

  const { data: accounts, isLoading: isAccountsLoading } = useCollection(accountsRef);

  // Fetch all users for the dropdown
  const usersRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collection(db, "users");
  }, [db, isAdminReady]);

  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersRef);

  // User Profile for the Dossier View
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !viewingClientPortfolio) return null;
    return doc(db, "users", viewingClientPortfolio);
  }, [db, viewingClientPortfolio]);

  const { data: userProfile } = useDoc(userProfileRef);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      return `$${amount.toLocaleString()}`;
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
      currency: newAccount.currency,
      userId: newAccount.userId,
      customerId: newAccount.userId,
      status: "Active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(colRef, accountData);
    toast({ title: "Account Initialized", description: "Capital has been successfully injected into the new client account." });
    setIsCreateDialogOpen(false);
    setNewAccount({ userId: "", accountType: "Current Account", balance: "1000", currency: "USD" });
  };

  const handleUpdateAccount = () => {
    if (!editingAccount || !db) return;
    const docRef = doc(db, "users", editingAccount.customerId || editingAccount.userId, "accounts", editingAccount.id);
    
    updateDocumentNonBlocking(docRef, {
      accountType: editingAccount.accountType,
      balance: Number(editingAccount.balance),
      currency: editingAccount.currency || "USD",
      status: editingAccount.status || "Active",
      updatedAt: serverTimestamp(),
    });

    toast({ title: "Ledger Corrected", description: `Financial records for ${editingAccount.accountNumber} updated successfully.` });
    setEditingAccount(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteAccount = (acc: any) => {
    if (!db) return;
    const docRef = doc(db, "users", acc.customerId || acc.userId, "accounts", acc.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Account Terminated", description: "The account record has been permanently removed from the ledger." });
  };

  const filteredAccounts = accounts?.filter(acc => 
    acc.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.customerId || acc.userId)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAdminRoleLoading && !isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Verifying Administrative Clearance...</p>
      </div>
    );
  }

  if (!isAdminConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">This terminal requires institutional administrator credentials.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Landmark className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Global Asset Audit</h1>
            <p className="text-muted-foreground">Full oversight and balance management across the Nexa network.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Client or Account..." 
              className="pl-10 h-11" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent h-11 px-6 font-black uppercase tracking-tighter">
            <PlusCircle className="mr-2 h-4 w-4" /> Open Account
          </Button>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg">Institutional Asset Ledger</CardTitle>
          <CardDescription>Auditing all capital holdings within the City International Bank ecosystem.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold py-4">Account #</TableHead>
                <TableHead className="font-bold">Client Identity</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Verified Balance</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAccountsLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-300" /></TableCell></TableRow>
              ) : filteredAccounts?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No accounts matching your search criteria were found.</TableCell></TableRow>
              ) : filteredAccounts?.map((acc) => (
                <TableRow key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-primary">{acc.accountNumber}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 truncate max-w-[150px]">{acc.customerId || acc.userId}</span>
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Client Record</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-black border-primary/20">{acc.accountType}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-primary text-base">
                    {formatCurrency(acc.balance || 0, acc.currency || 'USD')}
                  </TableCell>
                  <TableCell>
                    <Badge className={acc.status === 'Suspended' ? 'bg-red-100 text-red-700 border-none' : 'bg-green-100 text-green-700 border-none'}>
                      {acc.status || "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-primary hover:bg-primary/5"
                        onClick={() => setViewingClientPortfolio(acc.customerId || acc.userId)}
                        title="View Institutional Dossier"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-accent hover:bg-accent/5"
                        onClick={() => {
                          setEditingAccount({
                            ...acc,
                            balance: acc.balance ?? 0,
                            currency: acc.currency ?? "USD",
                            accountType: acc.accountType ?? "Current Account",
                            status: acc.status ?? "Active"
                          });
                          setIsEditDialogOpen(true);
                        }}
                        title="Adjust Capital / Edit"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:bg-red-50" onClick={() => handleDeleteAccount(acc)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Account Edit / Balance Adjustment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-8 bg-[#002B5B] text-white shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Capital Adjustment</DialogTitle>
                <DialogDescription className="text-white/60">Performing authorized correction for: {editingAccount?.accountNumber}</DialogDescription>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-[#002B5B]">Asset Configuration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Account Type</Label>
                  <Select value={editingAccount?.accountType} onValueChange={(v) => setEditingAccount({...editingAccount, accountType: v})}>
                    <SelectTrigger className="h-12 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Current Account">Current Account</SelectItem>
                      <SelectItem value="Savings Account">Savings Account</SelectItem>
                      <SelectItem value="Business Account">Business Account</SelectItem>
                      <SelectItem value="Internet Banking">Internet Banking</SelectItem>
                      <SelectItem value="Safety Deposits">Safety Deposits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Operational Status</Label>
                  <Select value={editingAccount?.status} onValueChange={(v) => setEditingAccount({...editingAccount, status: v})}>
                    <SelectTrigger className="h-12 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active / Unrestricted</SelectItem>
                      <SelectItem value="Suspended">Suspended / Restricted</SelectItem>
                      <SelectItem value="Locked">Locked / Administrative Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <Label className="text-xs font-black uppercase tracking-widest text-[#002B5B]">Financial Liquidity</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Verified Balance (Override)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-primary">$</span>
                    <Input 
                      type="number" 
                      step="0.01" 
                      className="h-14 font-black text-xl pl-8 border-primary/20 bg-primary/5 text-primary" 
                      value={editingAccount?.balance ?? ""} 
                      onChange={(e) => setEditingAccount({...editingAccount, balance: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Currency Rail</Label>
                  <Select value={editingAccount?.currency} onValueChange={(v) => setEditingAccount({...editingAccount, currency: v})}>
                    <SelectTrigger className="h-14 border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic font-medium">Manual balance overrides reflect instantly on the client's dashboard and are logged for internal audit.</p>
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 border-t flex gap-3 shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleUpdateAccount} className="flex-1 h-12 bg-[#002B5B] hover:bg-[#003B7B] rounded-xl font-black uppercase tracking-widest shadow-lg">Commit Corrections</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-8 bg-primary text-white shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl"><PlusCircle className="h-6 w-6" /></div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Open Institutional Account</DialogTitle>
                <DialogDescription className="text-white/60">Provisioning a new financial asset for a verified client.</DialogDescription>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Target Client</Label>
              <Select value={newAccount.userId} onValueChange={(val) => setNewAccount({...newAccount, userId: val})}>
                <SelectTrigger className="h-12 border-slate-200">
                  <SelectValue placeholder={isUsersLoading ? "Syncing client index..." : "Select verified client"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {allUsers?.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-bold">{u.firstName} {u.lastName}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">{u.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Account Type</Label>
                <Select value={newAccount.accountType} onValueChange={(v) => setNewAccount({...newAccount, accountType: v})}>
                  <SelectTrigger className="h-12 border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current Account">Current Account</SelectItem>
                    <SelectItem value="Savings Account">Savings Account</SelectItem>
                    <SelectItem value="Business Account">Business Account</SelectItem>
                    <SelectItem value="Internet Banking">Internet Banking</SelectItem>
                    <SelectItem value="Safety Deposits">Safety Deposits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Currency</Label>
                <Select value={newAccount.currency} onValueChange={(v) => setNewAccount({...newAccount, currency: v})}>
                  <SelectTrigger className="h-12 border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-500">Initial Capital Injection (Balance)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-primary">$</span>
                <Input 
                  type="number" 
                  className="h-14 font-black text-xl pl-8 border-primary/20 bg-primary/5 text-primary" 
                  value={newAccount.balance} 
                  onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-slate-50 border-t shrink-0">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleCreateAccount} className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest">Initialize Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Institutional Information Dossier Dialog */}
      <Dialog open={!!viewingClientPortfolio} onOpenChange={() => setViewingClientPortfolio(null)}>
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent">
          <div className="bg-[#E5E7EB] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-slate-300">
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="relative inline-block">
                <DialogTitle className="text-3xl font-bold text-[#002B5B] tracking-tight uppercase">Basic Information</DialogTitle>
                <div className="absolute -bottom-2 left-0 h-1.5 w-20 bg-[#2563EB]" />
              </div>
              
              <div className="flex flex-col items-center gap-6 pt-2">
                <div className="h-56 w-56 rounded-full bg-[#FFA07A] flex items-center justify-center overflow-hidden shadow-xl border-8 border-white">
                  {userProfile?.profilePictureUrl ? (
                    <img src={userProfile.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-7xl font-bold">{userProfile?.firstName?.charAt(0)}{userProfile?.lastName?.charAt(0)}</span>
                  )}
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-slate-700">
                    <span className="font-black text-[#002B5B]">Username:</span> {userProfile?.username || userProfile?.email?.split('@')[0]}
                  </p>
                  <p className="text-xl font-bold text-slate-700">
                    <span className="font-black text-[#002B5B]">Email:</span> <span className="underline underline-offset-4 decoration-slate-400">{userProfile?.email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-slate-300 text-xl text-slate-700">
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Name :</span>
                  <span className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Address 1:</span>
                  <span className="font-medium">{userProfile?.addressLine1 || "—"}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Address 2:</span>
                  <span className="font-medium">{userProfile?.addressLine2 || "—"}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">City/State/Zip:</span>
                  <span className="font-medium">
                    {userProfile?.city ? `${userProfile.city}, ${userProfile.state || ''} ${userProfile.postalCode || ''}` : '—'}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Country:</span>
                  <span className="font-medium">{userProfile?.country || "United Kingdom"}</span>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-300">
                {userProfile?.signature ? (
                  <div className="bg-white p-4 inline-block shadow-lg rounded-lg border border-slate-200">
                    <img src={userProfile.signature} alt="Signature" className="h-24 object-contain" />
                  </div>
                ) : (
                  <div className="h-24 w-full flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 italic text-sm">No signature authorized</div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-300">
                <Button onClick={() => setViewingClientPortfolio(null)} className="w-full h-12 rounded-xl font-bold bg-[#002B5B] hover:bg-[#003B7B]">Dismiss Dossier</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
