"use client";

import { useState } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    userRole: "client",
  });

  const usersRef = useMemoFirebase(() => collection(db, "users"), [db]);
  const { data: users, isLoading } = useCollection(usersRef);

  const handleCreateUser = () => {
    if (!formData.email || !formData.firstName) {
      toast({ variant: "destructive", title: "Error", description: "Email and First Name are required." });
      return;
    }

    // In a real app, this would integrate with Firebase Auth. 
    // Here we create the profile document as requested.
    const newUserId = "user_" + Math.random().toString(36).substr(2, 9);
    const userDocRef = doc(db, "users", newUserId);
    
    const newUserData = {
      ...formData,
      id: newUserId,
      addressId: "temp_address",
      dateOfBirth: "1990-01-01",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(userDocRef, newUserData, { merge: true });
    
    toast({ title: "User Profile Created", description: `Profile for ${formData.firstName} has been added.` });
    setIsCreating(false);
    setFormData({ firstName: "", lastName: "", email: "", phoneNumber: "", userRole: "client" });
  };

  const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">User Management</h1>
          <p className="text-muted-foreground">Create and manage client and admin profiles.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-accent">
          <UserPlus className="mr-2 h-4 w-4" /> {isCreating ? "Cancel" : "New Profile"}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle>Create New User Profile</CardTitle>
            <CardDescription>Manually create a profile for a new client or administrator.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.userRole} onValueChange={(v) => setFormData({...formData, userRole: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-6">
            <Button onClick={handleCreateUser}>Create Profile</Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Loading users...</TableCell></TableRow>
              ) : filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold">{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.userRole === 'admin' ? 'destructive' : 'secondary'}>
                      {user.userRole === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
                      {user.userRole}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell className="text-xs opacity-60">
                    {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
