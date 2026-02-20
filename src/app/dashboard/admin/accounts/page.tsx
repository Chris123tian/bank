"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc, serverTimestamp } from "firebase/firestore";
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
  DialogTrigger,
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
import { Landmark, ShieldAlert, Loader2, Edit3, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminAccountsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole;

  const accountsRef = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collectionGroup(db, "accounts");
  }, [db, isAdmin]);

  const { data: accounts, isLoading: isAccountsLoading } = useCollection(accountsRef);

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

  const handleUpdateAccount = () => {
    if (!editingAccount || !db) return;
    
    const docRef = doc(db, "users", editingAccount.userId, "accounts", editingAccount.id);
    
    updateDocumentNonBlocking(docRef, {
      accountType: editingAccount.accountType,
      balance: Number(editingAccount.balance),
      currency: editingAccount.currency || "USD",
      status: editingAccount.status || "Active",
      updatedAt: serverTimestamp(),
    });

    toast({ title: "Account Updated", description: `Record for ${editingAccount.accountNumber} has been modified.` });
    setEditingAccount(null);
    setIsDialogOpen(false);
  };

  const handleDeleteAccount = (acc: any) => {
    if (!db) return;
    const docRef = doc(db, "users", acc.userId, "accounts", acc.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Account Terminated", description: "The account record has been removed from the bank ledger." });
  };

  if (isAdminRoleLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!isAdmin) {
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
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Landmark className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Global Account Audit</h1>
          <p className="text-muted-foreground">Full oversight of all Checking and Savings assets.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Ledger</CardTitle>
          <CardDescription>Managing liquid capital across the City Bank network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAccountsLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">Syncing ledger...</TableCell></TableRow>
              ) : accounts?.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono text-xs">{acc.accountNumber}</TableCell>
                  <TableCell className="text-xs">{acc.userId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{acc.accountType}</Badge>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    {formatCurrency(acc.balance || 0, acc.currency || 'USD')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">{acc.currency || "USD"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={acc.status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                      {acc.status || "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingAccount({
                          ...acc,
                          balance: acc.balance ?? 0,
                          currency: acc.currency ?? "USD",
                          accountType: acc.accountType ?? "Checking",
                          status: acc.status ?? "Active"
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => handleDeleteAccount(acc)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Account: {editingAccount?.accountNumber}</DialogTitle>
            <DialogDescription>Adjust financial parameters and status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Account Balance</Label>
              <Input 
                type="number" 
                step="0.01"
                value={editingAccount?.balance ?? ""} 
                onChange={(e) => setEditingAccount({...editingAccount, balance: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={editingAccount?.currency ?? "USD"} 
                onValueChange={(v) => setEditingAccount({...editingAccount, currency: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select 
                value={editingAccount?.accountType ?? ""} 
                onValueChange={(v) => setEditingAccount({...editingAccount, accountType: v})}
              >
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Operational Status</Label>
              <Select 
                value={editingAccount?.status ?? "Active"} 
                onValueChange={(v) => setEditingAccount({...editingAccount, status: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Review Required">Review Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateAccount}>Apply Ledger Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}