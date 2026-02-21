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
  Landmark
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

  // Fetch accounts to allow filtering by account
  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: accountsLoading } = useCollection(accountsRef);

  // Use the first account if none is selected
  const activeAccountId = selectedAccountId || (accounts?.[0]?.id || null);

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !activeAccountId) return null;
    // Path-based query (authorized for standard users)
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Transaction History</h1>
          <p className="text-muted-foreground">A detailed log of your financial movements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-0 pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search merchant, ID, or amount..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select 
                value={activeAccountId || ""} 
                onValueChange={setSelectedAccountId}
                disabled={accountsLoading}
              >
                <SelectTrigger className="w-[220px]">
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
                  <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>

              <Button variant="secondary">
                <Filter className="mr-2 h-4 w-4" /> More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Merchant / Description</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || accountsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Syncing records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions && filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="group cursor-pointer hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-500">
                        {tx.transactionDate ? format(new Date(tx.transactionDate), "MMM dd, yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{tx.description}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{tx.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="font-normal capitalize">{tx.transactionType || "Other"}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${tx.status === 'completed' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`} />
                          <span className="text-xs capitalize">{tx.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-black ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                        {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <History className="h-12 w-12" />
                        <p className="text-sm font-bold uppercase tracking-widest">No transactions recorded</p>
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