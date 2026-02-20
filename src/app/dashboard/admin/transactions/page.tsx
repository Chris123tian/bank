"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Trash2, Edit3, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminTransactionsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const isMasterAdmin = user?.email === "citybank@gmail.com";
  const isAdmin = isMasterAdmin || (!!adminRole && !isAdminRoleLoading);

  const transactionsRef = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collectionGroup(db, "transactions");
  }, [db, isAdmin]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsRef);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(Math.abs(amount));
    } catch (e) {
      return `$${Math.abs(amount).toLocaleString()}`;
    }
  };

  const handleUpdateTransaction = () => {
    if (!editingTransaction || !db) return;

    const path = `users/${editingTransaction.userId}/accounts/${editingTransaction.accountId}/transactions/${editingTransaction.id}`;
    const docRef = doc(db, path);

    updateDocumentNonBlocking(docRef, {
      description: editingTransaction.description ?? "",
      amount: Number(editingTransaction.amount) || 0,
      status: editingTransaction.status ?? "pending",
      transactionDate: editingTransaction.transactionDate ?? new Date().toISOString(),
      transactionType: editingTransaction.transactionType ?? "withdrawal",
      currency: editingTransaction.currency ?? "USD",
    });

    toast({ title: "Transaction Updated", description: `Record for ID ${editingTransaction.id} has been modified.` });
    setEditingTransaction(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (transaction: any) => {
    if (!db) return;
    const path = `users/${transaction.userId}/accounts/${transaction.accountId}/transactions/${transaction.id}`;
    const docRef = doc(db, path);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Transaction Deleted", description: `Audit trail updated for ID: ${transaction.id}` });
  };

  if (isAdminRoleLoading && !isMasterAdmin) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
    <div className="max-w-7xl mx-auto space-y-6 text-foreground">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-100 rounded-xl text-red-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Transaction Audit</h1>
          <p className="text-muted-foreground">Global administrative access to modify or remove transaction records.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Ledger</CardTitle>
          <CardDescription>All transactions recorded across City International Bank network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Merchant / Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isTransactionsLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">Auditing records...</TableCell></TableRow>
              ) : transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs font-mono">{tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-xs font-mono">{tx.userId}</TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{tx.transactionType || "Other"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.status}</Badge>
                  </TableCell>
                  <TableCell className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400" 
                      onClick={() => {
                        setEditingTransaction({
                          ...tx,
                          amount: tx.amount ?? 0,
                          currency: tx.currency ?? "USD",
                          status: tx.status ?? "pending",
                          transactionType: tx.transactionType ?? "withdrawal"
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-600"
                      onClick={() => handleDelete(tx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isTransactionsLoading && (!transactions || transactions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic">
                    No transactions found in the global ledger.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modify Transaction Record</DialogTitle>
            <DialogDescription>ID: {editingTransaction?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Transaction Date</Label>
              <Input 
                type="datetime-local" 
                value={editingTransaction?.transactionDate?.slice(0, 16) ?? ""} 
                onChange={(e) => setEditingTransaction({...editingTransaction, transactionDate: new Date(e.target.value).toISOString()})}
              />
            </div>
            <div className="space-y-2">
              <Label>Merchant / Description</Label>
              <Input 
                value={editingTransaction?.description ?? ""} 
                onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Category (Type)</Label>
              <Select 
                value={editingTransaction?.transactionType ?? ""} 
                onValueChange={(v) => setEditingTransaction({...editingTransaction, transactionType: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="bill_payment">Bill Payment</SelectItem>
                  <SelectItem value="card_payment">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input 
                type="number" 
                step="0.01"
                value={editingTransaction?.amount ?? ""} 
                onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select 
                value={editingTransaction?.currency ?? "USD"} 
                onValueChange={(v) => setEditingTransaction({...editingTransaction, currency: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={editingTransaction?.status ?? "pending"} 
                onValueChange={(v) => setEditingTransaction({...editingTransaction, status: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateTransaction}>Apply Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}