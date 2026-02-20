
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Send, PlusCircle, CreditCard, Landmark, Repeat } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function TransferPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleTransfer = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Transfer Initiated",
        description: "Your funds are being processed and will arrive shortly.",
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-headline font-bold text-primary">Move Money</h1>
        <p className="text-muted-foreground">Transfer funds between accounts or to external recipients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Send className="h-5 w-5 text-accent" />
              Transfer Details
            </CardTitle>
            <CardDescription>Configure your transfer parameters below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Account</Label>
                <Select defaultValue="checking">
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Main Checking (...8821) - $24,562.00</SelectItem>
                    <SelectItem value="savings">Savings Plus (...4390) - $112,045.33</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Account</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings Plus (...4390)</SelectItem>
                    <SelectItem value="external-1">Chase Checking (*4412) - Dave</SelectItem>
                    <SelectItem value="external-2">Bank of America (*9902) - Rental</SelectItem>
                    <SelectItem value="new">+ Add New External Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                <Input type="number" placeholder="0.00" className="pl-8 text-lg font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Input placeholder="e.g. Rent Payment, Dinner Reimbursement" />
            </div>

            <div className="flex items-center space-x-2 bg-secondary/50 p-3 rounded-lg">
              <Checkbox id="recurring" />
              <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                <Repeat className="h-4 w-4" />
                Make this a recurring transfer
              </Label>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 flex justify-end gap-3 rounded-b-lg">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleTransfer} disabled={loading} className="bg-accent hover:bg-accent/90">
              {loading ? "Processing..." : "Confirm Transfer"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "David Chen", initial: "DC" },
                { name: "Rent Management", initial: "RM" },
                { name: "Savings Goal", initial: "SG" },
              ].map((contact) => (
                <button key={contact.name} className="flex items-center gap-3 w-full p-2 hover:bg-secondary rounded-lg transition-colors group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                    {contact.initial}
                  </div>
                  <span className="text-sm font-medium">{contact.name}</span>
                </button>
              ))}
              <Button variant="ghost" className="w-full text-accent flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Payee
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary text-white border-none">
            <CardHeader>
              <CardTitle className="text-lg">Security First</CardTitle>
            </CardHeader>
            <CardContent className="text-sm opacity-80">
              Internal transfers are instant. External transfers via NexaNetwork typically arrive within 24 hours. No fees for standard transfers.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
