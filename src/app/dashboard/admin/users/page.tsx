
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
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
import { UserPlus, Search, ShieldCheck, ShieldAlert, Loader2, Trash2, Eye, Edit3, User as UserIcon, Lock, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Verify Admin Status
  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !currentUser?.uid) return null;
    return doc(db, "roles_admin", currentUser.uid);
  }, [db, currentUser?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const isMasterAdmin = currentUser?.email === "citybank@gmail.com";
  const isAdminConfirmed = isMasterAdmin || (!!adminRole && !isAdminRoleLoading);
  
  const isAdminReady = isMasterAdmin || (!isAdminRoleLoading && isAdminConfirmed);

  // Form state for Manual Creation
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    userRole: "client",
  });

  const usersRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collection(db, "users");
  }, [db, isAdminReady]);

  const { data: users, isLoading: isUsersLoading } = useCollection(usersRef);

  const handleCreateUser = () => {
    if (!db || !formData.email || !formData.firstName) {
      toast({ variant: "destructive", title: "Error", description: "Email and First Name are required." });
      return;
    }

    // Since we can't create Auth accounts from client-side, 
    // we instruct the admin to use the same email they'll set in Firebase Console.
    const newUserId = "user_" + Math.random().toString(36).substr(2, 9);
    const userDocRef = doc(db, "users", newUserId);
    
    const newUserData = {
      ...formData,
      id: newUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(userDocRef, newUserData, { merge: true });
    
    toast({ 
      title: "Client Profile Provisioned", 
      description: `User ${formData.firstName} has been added. Remember to create their Auth account in the Firebase Console with email: ${formData.email}` 
    });
    setIsCreating(false);
    setFormData({ firstName: "", lastName: "", email: "", username: "", phoneNumber: "", userRole: "client" });
  };

  const handleUpdateUser = () => {
    if (!db || !editingUser) return;
    const userRef = doc(db, "users", editingUser.id);
    updateDocumentNonBlocking(userRef, {
      username: editingUser.username || "",
      email: editingUser.email || "",
      firstName: editingUser.firstName || "",
      lastName: editingUser.lastName || "",
      phoneNumber: editingUser.phoneNumber || "",
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
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  if (isAdminRoleLoading && !isMasterAdmin) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdminConfirmed) {
    return <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4"><ShieldAlert className="h-12 w-12 text-red-500" /><h2 className="text-2xl font-bold text-primary">Access Denied</h2></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Global User Audit</h1>
          <p className="text-muted-foreground">Managing client and administrative profiles across the Nexa network.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-accent">
          {isCreating ? "Cancel" : <><UserPlus className="mr-2 h-4 w-4" /> Provision New Profile</>}
        </Button>
      </div>

      {isCreating && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Key className="h-5 w-5 text-accent" /> Account Provisioning</CardTitle>
            <CardDescription>Enter client details to initialize their institutional profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="Legal First Name" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Legal Last Name" />
            </div>
            <div className="space-y-2">
              <Label>Institutional Email</Label>
              <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Regulatory Contact Email" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="Internal Handle" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1 (555) 000-0000" />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t p-6 flex flex-col items-start gap-4">
            <p className="text-[10px] text-muted-foreground italic max-w-2xl">
              Note: This action creates the Firestore data profile. You must manually create the login credentials in the Firebase Console using the same email address provided above.
            </p>
            <Button onClick={handleCreateUser} className="bg-primary w-full md:w-auto h-11 px-10">Initialize Client Profile</Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search global index by name or email..." className="pl-10 h-11" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Identity Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isUsersLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Syncing user ledger...</TableCell></TableRow>
              ) : filteredUsers?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold text-primary">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                        {u.profilePictureUrl ? <img src={u.profilePictureUrl} className="h-full w-full object-cover" /> : u.firstName?.charAt(0)}
                      </div>
                      <span className="truncate max-w-[120px]">{u.firstName} {u.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.userRole === 'admin' ? 'destructive' : 'secondary'} className="capitalize text-[10px]">
                      {u.userRole === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
                      {u.userRole || 'client'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {u.ssn ? <Badge className="bg-green-100 text-green-700">KYC Complete</Badge> : <Badge variant="outline">Pending KYC</Badge>}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewingUser(u)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => setEditingUser(u)}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Profile Modification Form */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl p-0 border-none rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-6 bg-slate-50 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><Edit3 className="h-5 w-5" /></div>
              <div>
                <DialogTitle className="text-xl font-bold">Modify Client Profile</DialogTitle>
                <DialogDescription>Updating records for client UID: {editingUser?.id}</DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4" /> Personal & Account Information
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label>First Name</Label>
                   <Input value={editingUser?.firstName || ""} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Last Name</Label>
                   <Input value={editingUser?.lastName || ""} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Username</Label>
                   <Input value={editingUser?.username || ""} onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Primary Email</Label>
                   <Input value={editingUser?.email || ""} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label>Phone Number</Label>
                   <Input value={editingUser?.phoneNumber || ""} onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})} />
                 </div>
               </div>
            </div>

            <div className="pt-6 border-t space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                  <UserIcon className="h-4 w-4" /> Residential Records (Read Only)
               </h4>
               <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed text-xs text-muted-foreground">
                  <p>Residential addresses and physical verification documents are locked for audit integrity. If a legal address change is required, please perform a manual database override.</p>
               </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 bg-slate-50 border-t shrink-0 flex gap-3">
            <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1 h-12 font-bold rounded-xl">Cancel</Button>
            <Button onClick={handleUpdateUser} className="flex-1 h-12 font-black bg-primary rounded-xl">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent">
          <div className="bg-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-300">
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="relative inline-block">
                <DialogTitle className="text-3xl font-bold text-[#002B5B] tracking-tight uppercase">Profile Information</DialogTitle>
                <div className="absolute -bottom-2 left-0 h-1.5 w-20 bg-[#2563EB]" />
              </div>
              
              <div className="flex flex-col items-center gap-6 pt-2">
                <div className="h-56 w-56 rounded-full bg-[#FFA07A] flex items-center justify-center overflow-hidden shadow-xl border-8 border-white">
                  {viewingUser?.profilePictureUrl ? (
                    <img src={viewingUser.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-7xl font-bold">{viewingUser?.firstName?.charAt(0)}{viewingUser?.lastName?.charAt(0)}</span>
                  )}
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold text-slate-700">
                    <span className="font-black text-[#002B5B]">Username:</span> {viewingUser?.username || viewingUser?.email?.split('@')[0]}
                  </p>
                  <p className="text-xl font-bold text-slate-700">
                    <span className="font-black text-[#002B5B]">Email:</span> <span className="underline underline-offset-4 decoration-slate-400">{viewingUser?.email}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-slate-300 text-xl text-slate-700">
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Name :</span>
                  <span className="font-medium">{viewingUser?.firstName} {viewingUser?.lastName}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Phone:</span>
                  <span className="font-medium">{viewingUser?.phoneNumber || "—"}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-black text-[#002B5B] min-w-[140px]">Created:</span>
                  <span className="font-medium">{viewingUser?.createdAt ? new Date(viewingUser.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-300">
                <Button onClick={() => setViewingUser(null)} className="w-full h-12 rounded-xl font-bold bg-[#002B5B] hover:bg-[#003B7B]">Dismiss Dossier</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
