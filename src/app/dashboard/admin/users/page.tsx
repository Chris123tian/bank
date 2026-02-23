
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Trash2, 
  Eye, 
  EyeOff,
  Edit3, 
  Key, 
  Upload,
  ImageIcon,
  FileSignature,
  X,
  Landmark,
  ArrowRight,
  MapPin,
  Hash
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { firebaseConfig } from "@/firebase/config";
import Link from "next/link";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state for Manual Creation
  const [formData, setFormData] = useState({
    accountNumber: `NEXA-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    username: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United Kingdom",
    userRole: "client",
    profilePictureUrl: "",
    signature: "",
  });

  // Verify Admin Status
  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !currentUser?.uid) return null;
    return doc(db, "roles_admin", currentUser.uid);
  }, [db, currentUser?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const isMasterAdmin = currentUser?.email === "citybank@gmail.com";
  const isAdminConfirmed = isMasterAdmin || (!!adminRole && !isAdminRoleLoading);
  const isAdminReady = isMasterAdmin || (!isAdminRoleLoading && isAdminConfirmed);

  const usersRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collection(db, "users");
  }, [db, isAdminReady]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersRef);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'signature', isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditingUser({ ...editingUser, [field]: reader.result as string });
        } else {
          setFormData(prev => ({ ...prev, [field]: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async () => {
    if (!db || !formData.email || !formData.firstName || !formData.password) {
      toast({ variant: "destructive", title: "Validation Error", description: "Email, Password, and First Name are required." });
      return;
    }

    setLoading(true);
    try {
      const secondaryAppName = `provisioning-${Date.now()}`;
      const secondaryApp = getApps().find(app => app.name === secondaryAppName) || initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      const newUid = userCredential.user.uid;

      const userDocRef = doc(db, "users", newUid);
      const newUserData = {
        id: newUid,
        accountNumber: formData.accountNumber || `NEXA-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        phoneNumber: formData.phoneNumber,
        temporaryPassword: formData.password, 
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        userRole: formData.userRole,
        profilePictureUrl: formData.profilePictureUrl,
        signature: formData.signature,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, newUserData, { merge: true });
      await signOut(secondaryAuth);

      toast({ 
        title: "Client Provisioned", 
        description: `Institutional profile NEXA-${newUserData.accountNumber.slice(-4)} successfully initialized.` 
      });
      setIsCreating(false);
      setFormData({ 
        accountNumber: `NEXA-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        firstName: "", lastName: "", email: "", password: "", username: "", 
        phoneNumber: "", addressLine1: "", addressLine2: "", city: "", 
        state: "", postalCode: "", country: "United Kingdom", userRole: "client",
        profilePictureUrl: "", signature: ""
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Provisioning Failed", description: error.message || "Could not create client account." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = () => {
    if (!db || !editingUser) return;
    const userRef = doc(db, "users", editingUser.id);
    updateDocumentNonBlocking(userRef, {
      accountNumber: editingUser.accountNumber || `NEXA-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      username: editingUser.username || "",
      email: editingUser.email || "",
      firstName: editingUser.firstName || "",
      lastName: editingUser.lastName || "",
      phoneNumber: editingUser.phoneNumber || "",
      temporaryPassword: editingUser.temporaryPassword || "",
      addressLine1: editingUser.addressLine1 || "",
      addressLine2: editingUser.addressLine2 || "",
      city: editingUser.city || "",
      state: editingUser.state || "",
      postalCode: editingUser.postalCode || "",
      country: editingUser.country || "United Kingdom",
      profilePictureUrl: editingUser.profilePictureUrl || "",
      signature: editingUser.signature || "",
      updatedAt: serverTimestamp(),
    });
    toast({ title: "Information Updated", description: `User profile modified successfully.` });
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (!db) return;
    if (userId === currentUser?.uid) {
      toast({ variant: "destructive", title: "Action Denied", description: "You cannot delete your own administrative account." });
      return;
    }
    const userRef = doc(db, "users", userId);
    deleteDocumentNonBlocking(userRef);
    toast({ title: "User Deleted", description: "The user profile has been removed from the system." });
  };

  const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.accountNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (isAdminRoleLoading && !isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Verifying Administrative Clearance...</p>
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Global User Audit</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Managing client and administrative profiles across the Nexa network.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-accent h-11 px-6 font-black uppercase tracking-tighter w-full md:w-auto shadow-lg">
          {isCreating ? "Cancel Creation" : <><UserPlus className="mr-2 h-4 w-4" /> Provision New Profile</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-t-4 border-accent shadow-2xl overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2"><Key className="h-5 w-5 text-accent" /> Account Provisioning</CardTitle>
            <CardDescription>Enter client details to initialize their institutional profile and login credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Master Account Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} className="h-11 pl-10 font-mono text-xs font-black bg-slate-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="Legal First Name" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Legal Last Name" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Email</Label>
                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Regulatory Contact Email" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Temporary Password</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Username</Label>
                <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="Internal Handle" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Phone Number</Label>
                <Input value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1 (555) 000-0000" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">Address Line 1</Label>
                <Input value={formData.addressLine1} onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t">
              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Profile Picture
                </Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden shrink-0 shadow-inner">
                    {formData.profilePictureUrl ? (
                      <img src={formData.profilePictureUrl} className="h-full w-full object-cover" alt="Profile preview" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profilePictureUrl')} className="h-10 text-xs" />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold text-center sm:text-left">Standard identification format preferred.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <FileSignature className="h-4 w-4" /> Authorized Signature
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="h-24 w-full bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-inner">
                    {formData.signature ? (
                      <img src={formData.signature} className="h-20 object-contain" alt="Signature preview" />
                    ) : (
                      <p className="text-[10px] text-slate-400 font-bold uppercase">No signature uploaded</p>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} className="h-10 text-xs" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-6">
            <Button onClick={handleCreateUser} className="bg-primary w-full h-12 px-12 font-black uppercase tracking-widest shadow-xl" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize & Initialize Client"}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="shadow-lg rounded-2xl overflow-hidden border-none">
        <CardHeader className="pb-0 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search global index by name, email or NEXA-ID..." className="pl-10 h-12 border-slate-200 focus-visible:ring-primary" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Client Identity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Master Account #</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Institutional Email</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Role</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUsersLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><div className="flex flex-col items-center gap-2"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /><span className="text-[10px] font-black uppercase text-slate-400">Syncing Registry...</span></div></TableCell></TableRow>
                ) : filteredUsers?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No client records matching your query were found in the global index.</TableCell></TableRow>
                ) : filteredUsers?.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none">
                    <TableCell className="font-bold text-primary py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden border shadow-sm shrink-0">
                          {u.profilePictureUrl ? <img src={u.profilePictureUrl} className="h-full w-full object-cover" /> : u.firstName?.charAt(0)}
                        </div>
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">{u.firstName} {u.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] font-black tracking-widest text-accent">{u.accountNumber || "PENDING"}</TableCell>
                    <TableCell className="truncate max-w-[150px] sm:max-w-none font-medium text-slate-600 font-mono text-xs">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.userRole === 'admin' ? 'destructive' : 'secondary'} className="capitalize text-[9px] font-black tracking-widest px-2">
                        {u.userRole === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
                        {u.userRole || 'client'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/5 shrink-0" onClick={() => setViewingUser(u)} title="View Dossier"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-accent hover:bg-accent/5 shrink-0" asChild title="Manage Assets">
                          <Link href={`/dashboard/admin/accounts?search=${u.id}`}>
                            <Landmark className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-100 shrink-0" onClick={() => setEditingUser(u)} title="Modify Records"><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:bg-red-50 shrink-0" onClick={() => handleDeleteUser(u.id)} title="Purge Record"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Profile Modification Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-3xl p-0 border-none rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col w-[95vw] sm:w-full">
          <div className="p-6 sm:p-8 bg-[#002B5B] text-white shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl shrink-0"><Edit3 className="h-6 w-6" /></div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight">Modify Institutional Profile</DialogTitle>
                <DialogDescription className="text-white/60 text-xs sm:text-sm">Updating regulatory records for client ID: {editingUser?.accountNumber || editingUser?.id}</DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#002B5B] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <ShieldCheck className="h-4 w-4" /> Legal Identification
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Master Account Number</Label>
                    <Input value={editingUser?.accountNumber || ""} onChange={(e) => setEditingUser({...editingUser, accountNumber: e.target.value})} className="h-11 font-mono text-xs font-black text-accent bg-slate-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">First Name</Label><Input value={editingUser?.firstName || ""} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} className="h-11" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Last Name</Label><Input value={editingUser?.lastName || ""} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} className="h-11" /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Internal Handle (Username)</Label><Input value={editingUser?.username || ""} onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} className="h-11" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500">Institutional Email</Label><Input value={editingUser?.email || ""} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="h-11" /></div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#002B5B] flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Upload className="h-4 w-4" /> Identity Assets
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Profile Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-slate-100 border overflow-hidden shrink-0 shadow-inner">
                        {editingUser?.profilePictureUrl ? <img src={editingUser.profilePictureUrl} className="h-full w-full object-cover" /> : <ImageIcon className="h-full w-full p-5 text-slate-300" />}
                      </div>
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profilePictureUrl', true)} className="h-10 text-xs shrink-0 w-full sm:w-auto" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Authorized Legal Signature</Label>
                    <div className="h-24 w-full bg-white border rounded-xl flex items-center justify-center overflow-hidden mb-2 shadow-inner">
                      {editingUser?.signature ? <img src={editingUser.signature} className="h-20 object-contain" /> : <p className="text-[10px] text-slate-300 italic">No signature authorized</p>}
                    </div>
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature', true)} className="h-10 text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 sm:p-8 bg-slate-50 border-t shrink-0 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1 h-12 font-bold rounded-xl order-2 sm:order-1">Cancel</Button>
            <Button onClick={handleUpdateUser} className="flex-1 h-12 font-black uppercase tracking-widest bg-[#002B5B] hover:bg-[#003B7B] text-white rounded-xl shadow-lg order-1 sm:order-2">Commit Registry Updates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Institutional Dossier View */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent shadow-none w-[95vw] sm:w-full">
          <div className="bg-[#E5E7EB] rounded-3xl p-6 sm:p-12 shadow-2xl border border-slate-300 relative">
            <button onClick={() => setViewingUser(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 z-10">
              <X className="h-6 w-6" />
            </button>
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="relative inline-block">
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#002B5B] tracking-tight uppercase">Basic Information</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs mt-2">Comprehensive profile breakdown for verified institutional client NEXA-{viewingUser?.accountNumber?.slice(-4)}.</DialogDescription>
                <div className="absolute -bottom-2 left-0 h-1.5 w-20 bg-[#2563EB]" />
              </div>
              
              <div className="flex flex-col items-center gap-6 pt-2">
                <div className="h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-[#FFA07A] flex items-center justify-center overflow-hidden shadow-2xl border-4 sm:border-8 border-white shrink-0">
                  {viewingUser?.profilePictureUrl ? (
                    <img src={viewingUser.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-5xl sm:text-7xl font-bold">{viewingUser?.firstName?.charAt(0)}{viewingUser?.lastName?.charAt(0)}</span>
                  )}
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-lg sm:text-xl font-bold text-slate-700">
                    <span className="font-black text-[#002B5B]">Master Account:</span> <span className="text-accent font-black tracking-widest">{viewingUser?.accountNumber || "PENDING"}</span>
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-slate-700">
                    <span className="font-black text-[#002B5B]">Username:</span> {viewingUser?.username || viewingUser?.email?.split('@')[0]}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-slate-700 break-all px-4">
                    <span className="font-black text-[#002B5B]">Email:</span> <span className="underline underline-offset-4 decoration-slate-400">{viewingUser?.email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-slate-300 text-base sm:text-xl text-slate-700">
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Name :</span>
                  <span className="font-medium">{viewingUser?.firstName} {viewingUser?.lastName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Jurisdiction:</span>
                  <span className="font-medium">{viewingUser?.country || "United Kingdom"}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-300 flex flex-col gap-4">
                <Button variant="outline" asChild className="w-full h-12 rounded-xl font-bold border-slate-300 shadow-sm">
                  <Link href={`/dashboard/admin/accounts?search=${viewingUser?.id}`}>
                    <Landmark className="mr-2 h-4 w-4" /> Financial Assets
                  </Link>
                </Button>
                <Button onClick={() => setViewingUser(null)} className="w-full h-14 rounded-2xl font-bold bg-[#002B5B] hover:bg-[#003B7B] shadow-xl text-lg uppercase tracking-wider">Dismiss Dossier</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
