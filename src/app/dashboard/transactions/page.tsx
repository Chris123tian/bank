"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Calendar as CalendarIcon,
  Loader2,
  History,
  Landmark,
  TrendingUp,
  ArrowDownRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function TransactionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [date, setDate] = useState<Date>();
  const [search, setSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  const activeAccountId = selectedAccountId || (accounts?.[0]?.id || null);

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !activeAccountId) return null;
    return query(
      collection(db, "users", user.uid, "accounts", activeAccountId, "transactions"),
      orderBy("transactionDate", "desc"),
      limit(50)
    );
  }, [db, user?.uid, activeAccountId]);

  const { data: transactions, isLoading } = useCollection(transactionsQuery);

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

  const filteredTransactions = transactions?.filter(t => 
    t.description?.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary uppercase tracking-tight">Transaction History</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">A detailed regulatory log of your financial movements.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="w-full md:w-auto font-bold border-slate-200 shadow-sm h-10">
            <Download className="mr-2 h-4 w-4" /> Export Ledger (CSV)
          </Button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden rounded-2xl border-none">
        <CardHeader className="pb-0 pt-6 px-4 sm:px-6">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search merchant, ID, or amount..." 
                className="pl-10 h-11 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <Select 
                value={activeAccountId || ""} 
                onValueChange={setSelectedAccountId}
                disabled={accountsLoading}
              >
                <SelectTrigger className="w-full sm:w-[220px] h-11 border-slate-200">
                  <Landmark className="mr-2 h-4 w-4 opacity-50" />
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.accountType} (...{acc.accountNumber.slice(-4)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:w-[160px] justify-start text-left font-normal h-11 border-slate-200">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">{date ? format(date, "PPP") : "Date Range"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>

              <Button variant="secondary" className="w-full sm:w-auto h-11 px-4">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[110px] sm:w-[140px] font-black text-[10px] uppercase tracking-widest text-slate-500 py-4 px-6">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Merchant / Description</TableHead>
                  <TableHead className="hidden sm:table-cell font-black text-[10px] uppercase tracking-widest text-slate-500">Category</TableHead>
                  <TableHead className="hidden md:table-cell font-black text-[10px] uppercase tracking-widest text-slate-500">Status</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500 px-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || accountsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Settlement Records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="group cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-none">
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
                            <span className="text-[8px] sm:text-[9px] text-muted-foreground font-mono truncate uppercase">ID: {tx.id.slice(0, 12)}...</span>
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No transactions recorded for this asset</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
