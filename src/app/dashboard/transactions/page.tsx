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
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreHorizontal,
  Calendar as CalendarIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const transactions = [
  { id: "TX-9901", date: "2023-10-24", merchant: "Apple Store", category: "Technology", amount: -1299.00, status: "Completed", currency: "USD" },
  { id: "TX-9902", date: "2023-10-22", merchant: "Monthly Salary", category: "Income", amount: 5500.00, status: "Completed", currency: "USD" },
  { id: "TX-9903", date: "2023-10-21", merchant: "Starbucks Coffee", category: "Food & Drink", amount: -6.45, status: "Completed", currency: "USD" },
  { id: "TX-9904", date: "2023-10-20", merchant: "Netflix", category: "Entertainment", amount: -15.99, status: "Processing", currency: "USD" },
  { id: "TX-9905", date: "2023-10-18", merchant: "Zelle Transfer - Mom", category: "Income", amount: 200.00, status: "Completed", currency: "USD" },
  { id: "TX-9906", date: "2023-10-15", merchant: "Shell Gas Station", category: "Transport", amount: -55.20, status: "Completed", currency: "USD" },
  { id: "TX-9907", date: "2023-10-12", merchant: "Whole Foods Market", category: "Groceries", amount: -142.12, status: "Completed", currency: "USD" },
  { id: "TX-9908", date: "2023-10-10", merchant: "Rent Payment", category: "Housing", amount: -2100.00, status: "Completed", currency: "USD" },
];

export default function TransactionsPage() {
  const [date, setDate] = useState<Date>();
  const [search, setSearch] = useState("");

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

  const filteredTransactions = transactions.filter(t => 
    t.merchant.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Transaction History</h1>
          <p className="text-muted-foreground">A detailed log of all your financial movements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" /> PDF Statement
          </Button>
        </div>
      </div>

      <Card>
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
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="food">Food & Drink</SelectItem>
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
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="group cursor-pointer hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-500">{tx.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{tx.merchant}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{tx.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="font-normal">{tx.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${tx.status === 'Completed' ? 'bg-green-500' : 'bg-orange-400 animate-pulse'}`} />
                        <span className="text-xs">{tx.status}</span>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}