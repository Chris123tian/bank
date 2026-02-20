"use client";

import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminTransactionsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole;

  // collectionGroup('transactions') allows admin to see all transactions across all users
  const transactionsRef = useMemoFirebase(() => {
    // Only query if we know the user is an admin to avoid permission errors
    if (!db || !isAdmin) return null;
    return collectionGroup(db, "transactions");
  }, [db, isAdmin]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsRef);

  const handleDelete = (transaction: any) => {
    const path = `users/${transaction.userId}/accounts/${transaction.accountId}/transactions/${transaction.id}`;
    const docRef = doc(db, path);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Transaction Deleted", description: `Audit trail updated for ID: ${transaction.id}` });
  };

  if (isAdminRoleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && !isAdminRoleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
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
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isTransactionsLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Auditing records...</TableCell></TableRow>
              ) : transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs font-mono">{tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-xs font-mono">{tx.userId}</TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.status}</Badge>
                  </TableCell>
                  <TableCell className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => toast({ title: "Edit Mode", description: "Edit functionality coming soon."})}>
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
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                    No transactions found in the global ledger.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}