
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  Search, 
  Plus, 
  Clock, 
  TrendingUp,
  History
} from "lucide-react";

export default function BillsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Bill Payments</h1>
          <p className="text-muted-foreground">Manage your monthly commitments and scheduled settlements.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 px-6 font-black uppercase tracking-widest shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Add New Payee
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Upcoming Payments</CardTitle>
                <CardDescription>Bills scheduled for settlement in the next 14 days.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <Receipt className="h-12 w-12 text-slate-300" />
              <p className="font-black text-primary uppercase tracking-[0.2em] text-xs">No upcoming settlements detected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Payees</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search global payees..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <History className="h-12 w-12 text-slate-300" />
              <p className="font-black text-primary uppercase tracking-[0.2em] text-xs">No saved payees in your registry</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-white border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Auto-Pay Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Active Instructions</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-80">Next Automated Cycle</span>
                <span className="font-bold">—</span>
              </div>
              <div className="flex items-center justify-between text-accent font-black pt-2 border-t border-white/10">
                <span className="text-sm">Total Value</span>
                <span>$0.00</span>
              </div>
              <Button variant="outline" className="w-full text-white border-white/30 hover:bg-white/10 mt-4 font-bold uppercase text-[10px] tracking-widest">
                Configure Autopay
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-none shadow-inner">
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Spending Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white text-slate-400 rounded-lg border">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Awaiting Data</p>
                  <p className="text-xs text-muted-foreground leading-tight">Historical analysis will appear after your first settlement.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
