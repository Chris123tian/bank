
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Receipt, 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const upcomingBills = [
  { id: 1, payee: "Pacific Gas & Electric", amount: "$142.50", dueDate: "Oct 28", category: "Utilities" },
  { id: 2, payee: "Verizon Wireless", amount: "$89.99", dueDate: "Nov 02", category: "Phone" },
  { id: 3, payee: "Equinox Gym", amount: "$210.00", dueDate: "Nov 05", category: "Health" },
];

const savedPayees = [
  { id: 101, name: "State Farm Insurance", lastPaid: "Oct 12, 2023", iconColor: "bg-red-100 text-red-600" },
  { id: 102, name: "Comcast Xfinity", lastPaid: "Sep 28, 2023", iconColor: "bg-blue-100 text-blue-600" },
  { id: 103, name: "Lease Management", lastPaid: "Oct 01, 2023", iconColor: "bg-slate-100 text-slate-600" },
];

export default function BillsPage() {
  const { toast } = useToast();
  const [loadingPayee, setLoadingPayee] = useState<number | null>(null);

  const handleQuickPay = (id: number) => {
    setLoadingPayee(id);
    setTimeout(() => {
      setLoadingPayee(null);
      toast({
        title: "Bill Paid Successfully",
        description: "Your payment has been scheduled and a confirmation email sent.",
      });
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Bill Payments</h1>
          <p className="text-muted-foreground">Manage your monthly commitments and payees.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" /> Add New Payee
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Upcoming Payments</CardTitle>
                <CardDescription>Bills due in the next 14 days.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-bold">
                <AlertCircle className="h-3 w-3 mr-1" /> 3 Due Soon
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBills.map((bill) => (
                  <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-secondary/20 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-primary">{bill.payee}</p>
                        <p className="text-xs text-muted-foreground">{bill.category} • Due {bill.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 justify-between sm:justify-end">
                      <p className="font-black text-lg">{bill.amount}</p>
                      <Button 
                        size="sm" 
                        onClick={() => handleQuickPay(bill.id)} 
                        disabled={loadingPayee === bill.id}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loadingPayee === bill.id ? "Paying..." : "Pay Now"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Payees</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search payees..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedPayees.map((payee) => (
                  <div key={payee.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-accent transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${payee.iconColor}`}>
                        {payee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-accent transition-colors">{payee.name}</p>
                        <p className="text-[10px] text-muted-foreground">Last paid {payee.lastPaid}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:text-accent">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-white border-none overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Auto-Pay Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Active Subscriptions</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Next Automated Cycle</span>
                <span className="font-bold">Nov 01</span>
              </div>
              <div className="flex items-center justify-between text-accent font-black">
                <span className="text-sm">Total Scheduled</span>
                <span>$1,452.12</span>
              </div>
              <Button variant="outline" className="w-full text-white border-white/30 hover:bg-white/10 mt-2">
                Manage Autopay
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Spending Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Utility savings</p>
                  <p className="text-xs text-muted-foreground">You saved 12% on utilities vs last month.</p>
                </div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Monthly Bill Budget</span>
                  <span className="font-bold">$2,000.00</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[72%]"></div>
                </div>
                <p className="text-[10px] text-right text-muted-foreground">72% used</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
