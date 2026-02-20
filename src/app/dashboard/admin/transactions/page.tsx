"use client";

import { useFirestore, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminTransactionsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();

  // collectionGroup('transactions') allows admin to see all transactions across all users
  const transactionsRef = useMemoFirebase(() => collectionGroup(db, "transactions"), [db]);
  const { data: transactions, isLoading } = useCollection(transactionsRef);

  const handleDelete = (transaction: any) => {
    // Correctly reconstruct path for deletion: /users/{userId}/accounts/{accountId}/transactions/{transactionId}
    const path = `users/${transaction.userId}/accounts/${transaction.accountId}/transactions/${transaction.id}`;
    const docRef = doc(db, path);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Transaction Deleted", description: `Audit trail updated for ID: ${transaction.id}` });
  };

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
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Auditing records...</TableCell></TableRow>
              ) : transactions?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs font-mono">{tx.transactionDate || 'N/A'}</TableCell>
                  <TableCell className="text-xs font-mono">{tx.userId}</TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.status}</Badge>
                  </TableCell>
                  <TableCell className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
