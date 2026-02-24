
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Download, 
  Loader2,
  History,
  TrendingUp,
  ArrowDownRight,
  User as UserIcon,
  Globe,
  Receipt,
  X,
  Info,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collectionGroup } from "firebase/firestore";

function TransactionsContent() {
  const { user } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const [viewingTransaction, setViewingTransaction] = useState<any>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const accId = searchParams.get('account');
    if (accId) {
      setSelectedAccountId(accId);
    }
  }, [searchParams]);

  /**
   * UNIFIED ADMIN-STYLE LEDGER:
   * Utilizing a broad collection group query.
   * Authorization is handled by prioritized security rules.
   * Local useMemo filtering handles the ownership boundary.
   */
  const transactionsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collectionGroup(db, "transactions");
  }, [db, user?.uid]);

  const { data: allTransactions, isLoading: transactionsLoading } = useCollection(transactionsRef);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(Math.abs(amount));
    } catch (e) {
      return `${currency} ${Math.abs(amount).toLocaleString()}`;
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!allTransactions || !user?.uid) return [];
    
    return allTransactions
      .filter(tx => {
        // Enforce ownership boundary client-side for the aggregate view
        if (tx.customerId !== user.uid && tx.userId !== user.uid) return false;
        
        if (selectedAccountId !== "all" && tx.accountId !== selectedAccountId) return false;
        
        const matchesSearch = 
          tx.description?.toLowerCase().includes(search.toLowerCase()) ||
          tx.id?.toLowerCase().includes(search.toLowerCase()) ||
          tx.metadata?.recipientName?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
        const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
        return dateB - dateA;
      });
  }, [allTransactions, search, selectedAccountId, user?.uid]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Institutional Ledger</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Comprehensive audit trail for global capital movements.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter ledger..." 
              className="pl-10 h-11 border-slate-200" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="h-11 w-full sm:w-64 border-slate-200">
              <SelectValue placeholder="All Assets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Global History (All Assets)</SelectItem>
              {allTransactions && Array.from(new Set(allTransactions.filter(t => t.customerId === user?.uid).map(t => t.accountId))).map(accId => (
                <SelectItem key={accId} value={accId}>
                  Asset Ref: ...{accId.slice(-6)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 font-bold border-slate-200 shadow-sm shrink-0">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden rounded-2xl border-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[110px] sm:w-[140px] font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Description</TableHead>
                  <TableHead className="hidden sm:table-cell font-black text-[10px] uppercase tracking-widest text-slate-500">Type</TableHead>
                  <TableHead className="hidden md:table-cell font-black text-[10px] uppercase tracking-widest text-slate-500">Status</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 px-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Ledger...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <TableRow 
                      key={tx.id} 
                      className="group cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none"
                      onClick={() => setViewingTransaction(tx)}
                    >
                      <TableCell className="text-[10px] sm:text-xs font-bold text-slate-500 py-4 px-6 whitespace-nowrap uppercase">
                        {tx.transactionDate ? format(new Date(tx.transactionDate), "MMM dd, yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            {tx.amount > 0 ? <TrendingUp className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col max-w-[140px] sm:max-w-none">
                            <span className="font-black text-primary text-xs sm:text-sm truncate uppercase tracking-tighter">{tx.description}</span>
                            <span className="text-[8px] sm:text-[9px] text-muted-foreground font-mono truncate uppercase">REF: {tx.id?.slice(0, 12)}...</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={`font-black capitalize text-[9px] px-2 ${tx.amount > 0 ? 'border-green-200 text-green-700 bg-green-50' : 'border-slate-200'}`}>
                          {tx.transactionType || "Other"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${tx.status === 'completed' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`} />
                          <span className="text-[10px] font-black uppercase tracking-tighter">{tx.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-black text-sm sm:text-lg whitespace-nowrap px-6 ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                        {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <History className="h-12 w-12 text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No financial movements found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent shadow-none w-[95vw] sm:w-full">
          <div className="bg-[#E5E7EB] rounded-3xl p-6 sm:p-12 shadow-2xl border border-slate-300 relative">
            <button onClick={() => setViewingTransaction(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-500 z-10">
              <X className="h-6 w-6" />
            </button>
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="relative inline-block">
                  <DialogHeader>
                    <DialogTitle className="text-2xl sm:text-3xl font-black text-[#002B5B] tracking-tight uppercase">Audit Insight</DialogTitle>
                    <DialogDescription className="text-[10px] font-mono text-slate-500 mt-2 break-all">
                      Comprehensive breakdown of institutional movement for transaction ID: {viewingTransaction?.id}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="absolute -bottom-2 left-0 h-1.5 w-24 bg-[#2563EB]" />
                </div>
                <div className="text-left sm:text-right">
                  <Badge className="bg-[#002B5B] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0">{viewingTransaction?.status || 'Completed'}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <Receipt className="h-4 w-4" /> Settlement Overview
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-500">Amount</span>
                        <span className={`text-2xl sm:text-3xl font-black break-all ${viewingTransaction?.amount > 0 ? 'text-green-600' : 'text-[#002B5B]'}`}>
                          {viewingTransaction?.amount > 0 ? '+' : '-'}{formatCurrency(viewingTransaction?.amount || 0, viewingTransaction?.currency)}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Execution Date</p>
                          <p className="font-bold text-slate-700">{viewingTransaction?.transactionDate ? format(new Date(viewingTransaction.transactionDate), "PPpp") : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Type</p>
                          <p className="font-bold text-slate-700 capitalize">{viewingTransaction?.transactionType}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <UserIcon className="h-4 w-4" /> Source Credentials
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-3 text-xs sm:text-sm">
                      <div className="flex flex-col sm:flex-row justify-between gap-1">
                        <span className="text-slate-500 font-bold shrink-0">Client ID:</span>
                        <span className="font-mono text-[10px] sm:text-xs break-all">{viewingTransaction?.customerId || viewingTransaction?.userId}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between gap-1">
                        <span className="text-slate-500 font-bold shrink-0">Source Asset:</span>
                        <span className="font-mono text-[10px] sm:text-xs break-all">{viewingTransaction?.accountId}</span>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Counterparty Details
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-4 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase">{viewingTransaction?.amount > 0 ? 'Sender Identification' : 'Recipient Identity'}</p>
                        <p className="font-bold text-slate-700 break-words">{viewingTransaction?.metadata?.recipientName || 'Institutional Internal'}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-mono break-all">{viewingTransaction?.metadata?.recipientAccount || '—'}</p>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Bank / Institution</p>
                          <p className="font-bold text-slate-700 break-words">{viewingTransaction?.metadata?.bankName || 'City Bank Global'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">System Rail</p>
                          <p className="font-bold text-slate-700">{viewingTransaction?.metadata?.paymentMethod || 'Internal Transfer'}</p>
                        </div>
                      </div>
                      {viewingTransaction?.metadata?.routingOrIban && (
                        <div className="space-y-1 pt-2 border-t border-slate-200/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Routing / IBAN</p>
                          <p className="font-mono text-[10px] sm:text-xs font-bold text-slate-700 break-all">{viewingTransaction.metadata.routingOrIban}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                      <Info className="h-4 w-4" /> Regulatory Memos
                    </h4>
                    <div className="bg-white/50 rounded-2xl p-6 border border-white/80 space-y-4 text-xs sm:text-sm">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Public Description</p>
                        <p className="italic text-slate-600 break-words">"{viewingTransaction?.description}"</p>
                      </div>
                      {viewingTransaction?.metadata?.note && (
                        <div className="space-y-1 pt-2 border-t border-slate-200">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Personal Note</p>
                          <p className="text-slate-600 break-words">{viewingTransaction.metadata.note}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-300">
                <Button onClick={() => setViewingTransaction(null)} className="w-full h-14 rounded-2xl font-black bg-[#002B5B] hover:bg-[#003B7B] shadow-xl text-white text-base sm:text-lg uppercase tracking-widest transition-all hover:scale-[1.01]">
                  Dismiss Audit Insight
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <TransactionsContent />
    </Suspense>
  );
}
