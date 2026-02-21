
"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, doc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CreditCard, ShieldAlert, Loader2, Edit3, Trash2, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function AdminCardsAuditPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [editingCard, setEditingCard] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  const isMasterAdmin = user?.email === "citybank@gmail.com";
  const isAdminConfirmed = isMasterAdmin || (!!adminRole && !isAdminRoleLoading);
  
  const isAdminReady = isMasterAdmin || (!isAdminRoleLoading && isAdminConfirmed);

  const cardsRef = useMemoFirebase(() => {
    if (!db || !isAdminReady) return null;
    return collectionGroup(db, "cards");
  }, [db, isAdminReady]);

  const { data: cards, isLoading: isCardsLoading } = useCollection(cardsRef);

  const handleUpdateCard = () => {
    if (!editingCard || !db) return;
    
    const docRef = doc(db, "users", editingCard.customerId, "cards", editingCard.id);
    
    updateDocumentNonBlocking(docRef, {
      status: editingCard.status,
      cardType: editingCard.cardType,
      cardNetwork: editingCard.cardNetwork,
      updatedAt: serverTimestamp(),
    });

    toast({ title: "Card Updated", description: `Security record for card ending in ${editingCard.lastFourDigits} modified.` });
    setEditingCard(null);
    setIsDialogOpen(false);
  };

  const handleDeleteCard = (c: any) => {
    if (!db) return;
    const docRef = doc(db, "users", c.customerId, "cards", c.id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Card Terminated", description: "The card has been permanently removed from the network." });
  };

  if (isAdminRoleLoading && !isMasterAdmin) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdminConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Administrative privileges required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <CreditCard className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Global Card Audit</h1>
          <p className="text-muted-foreground">Security oversight of all issued virtual and physical cards.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Security Ledger</CardTitle>
          <CardDescription>Full authority to freeze or revoke global card access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Ending</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCardsLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10">Syncing security records...</TableCell></TableRow>
              ) : cards?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">•••• {c.lastFourDigits}</TableCell>
                  <TableCell className="font-medium">{c.cardHolderName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.cardNetwork}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.cardType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingCard(c);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => handleDeleteCard(c)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isCardsLoading && (!cards || cards.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                    No card records found in the database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Security Parameters</DialogTitle>
            <DialogDescription>Card ending in {editingCard?.lastFourDigits}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Operational Status</Label>
              <Select 
                value={editingCard?.status || "Active"} 
                onValueChange={(v) => setEditingCard({...editingCard, status: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active / Unrestricted</SelectItem>
                  <SelectItem value="Frozen">Frozen / Administrative Hold</SelectItem>
                  <SelectItem value="Stolen">Reported Stolen</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select 
                value={editingCard?.cardType || "Debit"} 
                onValueChange={(v) => setEditingCard({...editingCard, cardType: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Debit">Debit</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Virtual">Virtual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateCard}>Apply Security Override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
