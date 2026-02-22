
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
import { Landmark, ShieldAlert, Loader2, Edit3, Trash2, PlusCircle, Eye, Search, Wallet } from "lucide-react";
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

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const isMasterAdmin = user?.email === "citybank@gmail.com";
  const isAdminConfirmed = isMasterAdmin || (!!adminRole && !isAdminRoleLoading);
  
  const isAdminReady = isMasterAdmin || (!isAdminRoleLoading && isAdminConfirmed);

  const accountsRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collectionGroup(db, "accounts");
  }, [db, isAdminReady]);

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
                      title="View Client Portfolio"
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

      {/* Client Portfolio Dialog */}
      <Dialog open={!!viewingClientPortfolio} onOpenChange={() => setViewingClientPortfolio(null)}>
        <DialogContent className="max-w-4xl p-0 border-none rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="bg-primary p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Wallet className="h-8 w-8 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black">Client Financial Portfolio</DialogTitle>
                <DialogDescription className="text-white/60 font-mono text-xs">
                  Global Identifier: {viewingClientPortfolio}
                </DialogDescription>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6 bg-slate-50">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Institutional Ledger Records</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientPortfolioAccounts?.map((acc) => (
                <Card key={acc.id} className="border-none shadow-sm overflow-hidden">
                  <div className={`h-1.5 w-full ${acc.status === 'Suspended' ? 'bg-red-500' : 'bg-accent'}`} />
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{acc.accountType}</p>
                        <p className="font-mono text-sm font-bold text-primary">{acc.accountNumber}</p>
                      </div>
                      <Badge variant="secondary" className="text-[9px]">{acc.status || "Active"}</Badge>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Available Capital</p>
                        <p className="text-xl font-black text-primary">{formatCurrency(acc.balance, acc.currency)}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{acc.currency || 'USD'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(!clientPortfolioAccounts || clientPortfolioAccounts.length === 0) && (
              <div className="text-center py-12 text-slate-400 italic">No associated accounts found for this identifier.</div>
            )}
          </div>
          
          <DialogFooter className="p-6 bg-white border-t">
            <Button onClick={() => setViewingClientPortfolio(null)} className="w-full h-12 rounded-xl font-bold bg-primary">Dismiss Portfolio View</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Creation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Account Entry</DialogTitle>
            <DialogDescription>Create a new account for an existing client UID.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Target User ID</Label>
              <Input 
                placeholder="Paste UID here" 
                value={newAccount.userId} 
                onChange={(e) => setNewAccount({...newAccount, userId: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={newAccount.accountType} onValueChange={(v) => setNewAccount({...newAccount, accountType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>Initial Balance</Label>
                <Input 
                  type="number" 
                  value={newAccount.balance} 
                  onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={newAccount.currency} onValueChange={(v) => setNewAccount({...newAccount, currency: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateAccount} className="bg-primary w-full">Inject Ledger Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Account: {editingAccount?.accountNumber}</DialogTitle>
            <DialogDescription>Adjust financial parameters and operational status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select 
                value={editingAccount?.accountType ?? "Current Account"} 
                onValueChange={(v) => setEditingAccount({...editingAccount, accountType: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>Account Balance</Label>
              <Input 
                type="number" 
                step="0.01"
                value={editingAccount?.balance ?? ""} 
                onChange={(e) => setEditingAccount({...editingAccount, balance: e.target.value})}
              />
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
            <Button onClick={handleUpdateAccount} className="w-full">Apply Ledger Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
