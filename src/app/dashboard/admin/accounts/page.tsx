
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
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminAccountsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [viewingClientPortfolio, setViewingClientPortfolio] = useState<string | null>(null);
  const [editingProfileSection, setEditingProfileSection] = useState<{ type: string; data: any } | null>(null);
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

  // User Profile for the Dossier View
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !viewingClientPortfolio) return null;
    return doc(db, "users", viewingClientPortfolio);
  }, [db, viewingClientPortfolio]);

  const { data: userProfile, isLoading: isUserProfileLoading } = useDoc(userProfileRef);

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
      toast({ variant: "destructive", title: "Missing ID", description: "Target User ID is required." });
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
    toast({ title: "Account Created", description: `Manual entry for user ${newAccount.userId} added.` });
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

    toast({ title: "Account Updated", description: `Record for ${editingAccount.accountNumber} has been modified.` });
    setEditingAccount(null);
    setIsEditDialogOpen(false);
  };

  const handleUpdateProfileSection = () => {
    if (!db || !editingProfileSection || !viewingClientPortfolio) return;
    const profileRef = doc(db, "users", viewingClientPortfolio);
    updateDocumentNonBlocking(profileRef, {
      ...editingProfileSection.data,
      updatedAt: serverTimestamp(),
    });
    toast({ title: "Section Updated", description: `${editingProfileSection.type} modified successfully.` });
    setEditingProfileSection(null);
  };

  const handleDeleteAccount = (acc: any) => {
    if (!db) return;
    const docRef = doc(db, "users", acc.customerId || acc.userId, "accounts", acc.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Account Terminated", description: "The account record has been removed from the bank ledger." });
  };

  const filteredAccounts = accounts?.filter(acc => 
    acc.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.customerId || acc.userId)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clientPortfolioAccounts = accounts?.filter(acc => 
    (acc.customerId || acc.userId) === viewingClientPortfolio
  );

  if (isAdminRoleLoading && !isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Verifying Credentials...</p>
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Landmark className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Global Account Audit</h1>
            <p className="text-muted-foreground">Full oversight of all institutional assets.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Client or Account..." 
              className="pl-10 h-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-accent h-10">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Account
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Ledger</CardTitle>
          <CardDescription>Managing institutional capital across the Nexa International network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Owner ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAccountsLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Syncing ledger...</TableCell></TableRow>
              ) : filteredAccounts?.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono text-xs">{acc.accountNumber}</TableCell>
                  <TableCell className="text-xs truncate max-w-[120px]">{acc.customerId || acc.userId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{acc.accountType}</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(acc.balance || 0, acc.currency || 'USD')}
                  </TableCell>
                  <TableCell>
                    <Badge className={acc.status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                      {acc.status || "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary"
                      onClick={() => setViewingClientPortfolio(acc.customerId || acc.userId)}
                      title="View Institutional Dossier"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
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
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDeleteAccount(acc)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Account Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-6 bg-slate-50 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Edit3 className="h-5 w-5" /></div>
              <div>
                <DialogTitle className="text-xl font-bold">Edit Account Record</DialogTitle>
                <DialogDescription>Modifying ledger for: {editingAccount?.accountNumber}</DialogDescription>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={editingAccount?.accountType} onValueChange={(v) => setEditingAccount({...editingAccount, accountType: v})}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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
                <Label>Operational Status</Label>
                <Select value={editingAccount?.status} onValueChange={(v) => setEditingAccount({...editingAccount, status: v})}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active / Unrestricted</SelectItem>
                    <SelectItem value="Suspended">Suspended / Restricted</SelectItem>
                    <SelectItem value="Locked">Locked / Administrative Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Balance Override</Label>
                <Input type="number" step="0.01" className="h-11 font-bold" value={editingAccount?.balance ?? ""} onChange={(e) => setEditingAccount({...editingAccount, balance: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={editingAccount?.currency} onValueChange={(v) => setEditingAccount({...editingAccount, currency: v})}>
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
          <DialogFooter className="p-6 bg-slate-50 border-t shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={handleUpdateAccount} className="flex-1 h-12 bg-primary rounded-xl font-bold">Apply Corrections</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Institutional Information Dossier Dialog - Redesigned based on request image */}
      <Dialog open={!!viewingClientPortfolio} onOpenChange={() => setViewingClientPortfolio(null)}>
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent">
          <div className="bg-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-300">
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

      {/* Section Edit Dialog */}
      <Dialog open={!!editingProfileSection} onOpenChange={() => setEditingProfileSection(null)}>
        <DialogContent className="max-w-xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-6 bg-slate-50 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Edit3 className="h-5 w-5" /></div>
              <div>
                <DialogTitle className="text-xl font-bold">Edit {editingProfileSection?.type}</DialogTitle>
                <DialogDescription>Performing authorized override for client: {viewingClientPortfolio}</DialogDescription>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {editingProfileSection?.type === "Personal Identity" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input value={editingProfileSection.data.firstName} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, firstName: e.target.value}})} /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input value={editingProfileSection.data.lastName} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, lastName: e.target.value}})} /></div>
                <div className="space-y-2"><Label>DOB</Label><Input type="date" value={editingProfileSection.data.dob} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, dob: e.target.value}})} /></div>
                <div className="space-y-2"><Label>SSN/TIN</Label><Input value={editingProfileSection.data.ssn} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, ssn: e.target.value}})} /></div>
                <div className="space-y-2 col-span-2"><Label>Phone</Label><Input value={editingProfileSection.data.phoneNumber} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, phoneNumber: e.target.value}})} /></div>
              </div>
            )}
            {editingProfileSection?.type === "Residential Verification" && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Street Address</Label><Input value={editingProfileSection.data.addressLine1} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, addressLine1: e.target.value}})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input value={editingProfileSection.data.city} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, city: e.target.value}})} /></div>
                  <div className="space-y-2"><Label>State</Label><Input value={editingProfileSection.data.state} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, state: e.target.value}})} /></div>
                </div>
              </div>
            )}
            {editingProfileSection?.type === "Professional Profile" && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2"><Label>Employer</Label><Input value={editingProfileSection.data.employerName} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, employerName: e.target.value}})} /></div>
                <div className="space-y-2"><Label>Income</Label><Input type="number" value={editingProfileSection.data.annualIncome} onChange={(e) => setEditingProfileSection({...editingProfileSection, data: {...editingProfileSection.data, annualIncome: Number(e.target.value)}})} /></div>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 bg-slate-50 border-t shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setEditingProfileSection(null)} className="flex-1 h-12 font-bold rounded-xl">Cancel</Button>
            <Button onClick={handleUpdateProfileSection} className="flex-1 h-12 font-black bg-primary rounded-xl">Commit Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
