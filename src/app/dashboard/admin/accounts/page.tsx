
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
  Wallet,
  User as UserIcon,
  Briefcase,
  MapPin,
  ShieldCheck,
  FileText,
  CreditCard,
  Separator,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminAccountsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [viewingClientPortfolio, setViewingClientPortfolio] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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

  // User Profile for the Portfolio View
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

  const handleUpdateProfile = () => {
    if (!db || !editingProfile) return;
    const profileRef = doc(db, "users", editingProfile.id);
    updateDocumentNonBlocking(profileRef, {
      ...editingProfile,
      updatedAt: serverTimestamp(),
    });
    toast({ title: "Profile Updated", description: "Basic Information records have been modified." });
    setIsEditProfileOpen(false);
    setEditingProfile(null);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProfile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProfile({ ...editingProfile, signature: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
                      title="View Client Basic Information"
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
              {!isAccountsLoading && (!filteredAccounts || filteredAccounts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                    No account records found for this query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Basic Information Dossier Dialog */}
      <Dialog open={!!viewingClientPortfolio} onOpenChange={() => setViewingClientPortfolio(null)}>
        <DialogContent className="max-w-5xl p-0 border-none rounded-[2rem] overflow-hidden shadow-2xl bg-white max-h-[95vh] flex flex-col">
          <div className="bg-primary p-8 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <ShieldCheck className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black">Basic Information</DialogTitle>
                  <DialogDescription className="text-white/60 font-mono text-xs uppercase tracking-widest">
                    Verified Global Identifier: {viewingClientPortfolio}
                  </DialogDescription>
                </div>
              </div>
              {isUserProfileLoading && <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-50/50">
            {userProfile ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Personal & Identity */}
                <div className="lg:col-span-2 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> Personal Identity Records
                      </h3>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => { setEditingProfile({...userProfile}); setIsEditProfileOpen(true); }}>
                        <Edit3 className="h-3 w-3 mr-1" /> Edit Section
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border shadow-sm">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Legal Full Name</Label>
                        <p className="font-bold text-primary">{userProfile.firstName} {userProfile.lastName}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</Label>
                        <p className="font-medium">{userProfile.dob || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">SSN / Tax Identification</Label>
                        <p className="font-mono text-sm">•••• •••• {userProfile.ssn?.slice(-4) || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Primary Email</Label>
                        <p className="font-medium underline decoration-slate-200">{userProfile.email}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Residential & Physical Verification
                      </h3>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => { setEditingProfile({...userProfile}); setIsEditProfileOpen(true); }}>
                        <Edit3 className="h-3 w-3 mr-1" /> Edit Section
                      </Button>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Registered Address</Label>
                        <p className="font-medium leading-relaxed">
                          {userProfile.addressLine1}<br />
                          {userProfile.city}, {userProfile.state} {userProfile.postalCode}<br />
                          <span className="text-primary font-bold">{userProfile.country || "United States"}</span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Government ID</Label>
                          <Badge variant="outline" className="bg-green-50 text-green-700">Verified (E-KYC)</Badge>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-400 uppercase">Proof of Address</Label>
                          <Badge variant="outline" className="bg-green-50 text-green-700">Audit Confirmed</Badge>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Professional & Financial Profile
                      </h3>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => { setEditingProfile({...userProfile}); setIsEditProfileOpen(true); }}>
                        <Edit3 className="h-3 w-3 mr-1" /> Edit Section
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border shadow-sm">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Employment Status</Label>
                        <p className="font-bold">{userProfile.employmentStatus || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Annual Household Income</Label>
                        <p className="font-black text-accent">{formatCurrency(userProfile.annualIncome || 0)}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Employer / Entity</Label>
                        <p className="font-medium">{userProfile.employerName || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Job Title</Label>
                        <p className="font-medium">{userProfile.jobTitle || "—"}</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Signature & Accounts Summary */}
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Legal Authorization
                      </h3>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => { setEditingProfile({...userProfile}); setIsEditProfileOpen(true); }}>
                        <Edit3 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
                      <Label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">Authenticated Signature</Label>
                      {userProfile.signature ? (
                        <img src={userProfile.signature} alt="Legal Signature" className="h-24 w-full object-contain bg-slate-50 border rounded-lg p-2" />
                      ) : (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 italic text-slate-300 text-xs">No signature on file</div>
                      )}
                      <p className="text-[8px] text-slate-400 mt-3 uppercase font-black tracking-tighter">
                        Consent Recorded: {userProfile.updatedAt ? new Date(userProfile.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Managed Asset Ledger
                    </h3>
                    <div className="space-y-3">
                      {clientPortfolioAccounts?.map((acc) => (
                        <div key={acc.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-accent transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="text-[9px]">{acc.accountType}</Badge>
                            <span className={`h-2 w-2 rounded-full ${acc.status === 'Suspended' ? 'bg-red-500' : 'bg-green-500'}`} />
                          </div>
                          <p className="font-mono text-xs font-bold text-primary">{acc.accountNumber}</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{formatCurrency(acc.balance, acc.currency)}</p>
                        </div>
                      ))}
                      {(!clientPortfolioAccounts || clientPortfolioAccounts.length === 0) && (
                        <div className="text-center py-6 text-slate-400 italic text-sm">No associated assets found.</div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 italic">Initializing Basic Information...</div>
            )}
          </div>
          
          <DialogFooter className="p-6 bg-white border-t shrink-0">
            <Button onClick={() => setViewingClientPortfolio(null)} className="w-full h-12 rounded-xl font-bold bg-primary shadow-lg">Dismiss Dossier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Modification Dialog (Administrative Override) */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-4xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
          <div className="p-6 bg-slate-50 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Edit3 className="h-5 w-5" /></div>
              <div>
                <DialogTitle className="text-xl font-bold">Administrative Modification</DialogTitle>
                <DialogDescription>Updating Basic Information for client UID: {editingProfile?.id}</DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <UserIcon className="h-3 w-3" /> Personal Identity
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>First Name</Label><Input value={editingProfile?.firstName || ""} onChange={(e) => setEditingProfile({...editingProfile, firstName: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input value={editingProfile?.lastName || ""} onChange={(e) => setEditingProfile({...editingProfile, lastName: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={editingProfile?.dob || ""} onChange={(e) => setEditingProfile({...editingProfile, dob: e.target.value})} /></div>
                  <div className="space-y-2"><Label>SSN / Tax ID</Label><Input value={editingProfile?.ssn || ""} onChange={(e) => setEditingProfile({...editingProfile, ssn: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Phone Number</Label><Input value={editingProfile?.phoneNumber || ""} onChange={(e) => setEditingProfile({...editingProfile, phoneNumber: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Username</Label><Input value={editingProfile?.username || ""} onChange={(e) => setEditingProfile({...editingProfile, username: e.target.value})} /></div>
                </div>
              </div>

              {/* Residential Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Residential Verification
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>Street Address</Label><Input value={editingProfile?.addressLine1 || ""} onChange={(e) => setEditingProfile({...editingProfile, addressLine1: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>City</Label><Input value={editingProfile?.city || ""} onChange={(e) => setEditingProfile({...editingProfile, city: e.target.value})} /></div>
                    <div className="space-y-2"><Label>State</Label><Input value={editingProfile?.state || ""} onChange={(e) => setEditingProfile({...editingProfile, state: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Zip Code</Label><Input value={editingProfile?.postalCode || ""} onChange={(e) => setEditingProfile({...editingProfile, postalCode: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Country</Label><Input value={editingProfile?.country || "USA"} onChange={(e) => setEditingProfile({...editingProfile, country: e.target.value})} /></div>
                  </div>
                </div>
              </div>

              {/* Professional Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Briefcase className="h-3 w-3" /> Financial Profile
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Employment Status</Label>
                    <Select value={editingProfile?.employmentStatus || "Full-Time"} onValueChange={(v) => setEditingProfile({...editingProfile, employmentStatus: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                        <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Employer Entity</Label><Input value={editingProfile?.employerName || ""} onChange={(e) => setEditingProfile({...editingProfile, employerName: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Job Title</Label><Input value={editingProfile?.jobTitle || ""} onChange={(e) => setEditingProfile({...editingProfile, jobTitle: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Annual Household Income</Label><Input type="number" value={editingProfile?.annualIncome || ""} onChange={(e) => setEditingProfile({...editingProfile, annualIncome: Number(e.target.value)})} /></div>
                </div>
              </div>

              {/* Authorization Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Legal Authorization
                </h4>
                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-4">
                  {editingProfile?.signature ? (
                    <div className="relative group">
                      <img src={editingProfile.signature} alt="Signature" className="h-24 w-full object-contain bg-white border rounded p-2" />
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingProfile({...editingProfile, signature: ""})}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg hover:border-primary cursor-pointer transition-all bg-white">
                      <Upload className="h-5 w-5 text-slate-400 mb-2" />
                      <span className="text-[10px] font-bold text-slate-500">Update Legal Signature</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                    </label>
                  )}
                  <p className="text-[9px] text-muted-foreground uppercase font-black text-center">Administrative Overwrite Warning</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-slate-50 border-t shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} className="flex-1 h-12 font-bold rounded-xl">Cancel Modification</Button>
            <Button onClick={handleUpdateProfile} className="flex-1 h-12 font-black bg-primary rounded-xl">Commit Institutional Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
