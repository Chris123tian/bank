
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { UserPlus, Search, ShieldCheck, ShieldAlert, Loader2, Trash2, Eye, Edit3, Upload } from "lucide-react";
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

    const newUserId = "user_" + Math.random().toString(36).substr(2, 9);
    const userDocRef = doc(db, "users", newUserId);
    
    const newUserData = {
      ...formData,
      id: newUserId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(userDocRef, newUserData, { merge: true });
    
    toast({ title: "User Profile Created", description: `Profile for ${formData.firstName} has been added.` });
    setIsCreating(false);
    setFormData({ firstName: "", lastName: "", email: "", phoneNumber: "", userRole: "client" });
  };

  const handleUpdateUser = () => {
    if (!db || !editingUser) return;
    const userRef = doc(db, "users", editingUser.id);
    updateDocumentNonBlocking(userRef, {
      ...editingUser,
      updatedAt: serverTimestamp(),
    });
    toast({ title: "Profile Updated", description: `User ${editingUser.firstName} profile modified.` });
    setEditingUser(null);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingUser({ ...editingUser, signature: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
          {isCreating ? "Cancel" : <><UserPlus className="mr-2 h-4 w-4" /> New Profile</>}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search global index..." className="pl-10 h-11" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {/* Edit Profile Dialog - Admin Only */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Administrative Profile Modification</DialogTitle>
            <DialogDescription>Updating institutional records for UID: {editingUser?.id}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Personal & Identity</h4>
              <div className="space-y-2"><Label>First Name</Label><Input value={editingUser?.firstName || ""} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={editingUser?.lastName || ""} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} /></div>
              <div className="space-y-2"><Label>DOB</Label><Input type="date" value={editingUser?.dob || ""} onChange={(e) => setEditingUser({...editingUser, dob: e.target.value})} /></div>
              <div className="space-y-2"><Label>SSN / Tax ID</Label><Input value={editingUser?.ssn || ""} onChange={(e) => setEditingUser({...editingUser, ssn: e.target.value})} /></div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Professional Records</h4>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editingUser?.employmentStatus || "Full-Time"} onValueChange={(v) => setEditingUser({...editingUser, employmentStatus: v})}>
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
              <div className="space-y-2"><Label>Employer</Label><Input value={editingUser?.employerName || ""} onChange={(e) => setEditingUser({...editingUser, employerName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Job Title</Label><Input value={editingUser?.jobTitle || ""} onChange={(e) => setEditingUser({...editingUser, jobTitle: e.target.value})} /></div>
              <div className="space-y-2"><Label>Annual Income</Label><Input type="number" value={editingUser?.annualIncome || ""} onChange={(e) => setEditingUser({...editingUser, annualIncome: e.target.value})} /></div>
            </div>
            <div className="md:col-span-2 space-y-4 border-t pt-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Signature Override</h4>
              <div className="flex items-center gap-4">
                {editingUser?.signature && <img src={editingUser.signature} className="h-16 w-32 object-contain bg-slate-50 border rounded p-2" />}
                <label className="flex-1 cursor-pointer flex items-center justify-center h-16 border-2 border-dashed border-slate-200 rounded-lg hover:border-primary transition-colors">
                  <Upload className="h-5 w-5 mr-2" /> Upload New Signature
                  <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button onClick={handleUpdateUser} className="w-full h-12">Commit Institutional Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail View Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent">
          <div className="bg-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-300">
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="relative inline-block">
                <DialogTitle className="text-3xl font-bold text-[#002B5B] tracking-tight uppercase">Institutional Information</DialogTitle>
                <DialogDescription className="sr-only">Detailed view of the client's global institutional profile.</DialogDescription>
                <div className="absolute -bottom-2 left-0 h-1.5 w-20 bg-[#2563EB]" />
              </div>
              
              <div className="flex justify-center pt-2">
                <div className="h-56 w-56 rounded-full bg-[#FFA07A] flex items-center justify-center overflow-hidden shadow-xl border-8 border-white">
                  {viewingUser?.profilePictureUrl ? (
                    <img src={viewingUser.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-7xl font-bold">{viewingUser?.firstName?.charAt(0)}{viewingUser?.lastName?.charAt(0)}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-6 text-xl text-slate-700">
                <div className="flex gap-2">
                  <span className="font-bold min-w-[120px]">Email:</span>
                  <span className="font-medium underline underline-offset-4">{viewingUser?.email}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold min-w-[120px]">DOB:</span>
                  <span className="font-medium">{viewingUser?.dob || "N/A"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold min-w-[120px]">SSN/TIN:</span>
                  <span className="font-medium">{viewingUser?.ssn || "N/A"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold min-w-[120px]">Phone:</span>
                  <span className="font-medium">{viewingUser?.phoneNumber || "N/A"}</span>
                </div>
              </div>

              <div className="pt-8 space-y-5 border-t border-slate-300">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Professional Records</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xl text-slate-700">
                  <div className="flex gap-2">
                    <span className="font-bold min-w-[160px]">Status:</span>
                    <span className="font-medium">{viewingUser?.employmentStatus || "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold min-w-[160px]">Income:</span>
                    <span className="font-medium">${viewingUser?.annualIncome?.toLocaleString() || "0"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-12">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Authenticated Legal Signature</p>
                <div className="bg-white p-6 inline-block shadow-lg rounded-xl min-w-[250px] border border-slate-200">
                  {viewingUser?.signature ? (
                    <img src={viewingUser.signature} alt="Signature" className="h-24 object-contain mx-auto" />
                  ) : (
                    <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-100 italic text-slate-300 text-sm">No signature authorized</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
