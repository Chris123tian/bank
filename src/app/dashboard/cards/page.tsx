
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  ShieldCheck, 
  Settings2, 
  Lock, 
  Zap, 
  BellRing,
  Smartphone,
  Info
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function CardsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-headline font-bold text-primary">Card Management</h1>
        <p className="text-muted-foreground">Manage your physical and virtual cards securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="relative h-64 w-full max-w-md mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 text-white flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard className="h-32 w-32" />
              </div>
              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.2em] opacity-60">Nexa Platinum</p>
                  <p className="font-bold text-lg mt-1">Alex Thompson</p>
                </div>
                <Zap className="h-8 w-8 text-accent fill-accent" />
              </div>
              <div className="z-10">
                <p className="text-2xl font-mono tracking-widest">•••• •••• •••• 1201</p>
                <div className="flex gap-8 mt-4">
                  <div>
                    <p className="text-[10px] opacity-40 uppercase">Expires</p>
                    <p className="text-sm font-mono">12/27</p>
                  </div>
                  <div>
                    <p className="text-[10px] opacity-40 uppercase">CVV</p>
                    <p className="text-sm font-mono">***</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Freeze Card
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Change PIN
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security & Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Online Transactions</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable payments for online stores.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">International Payments</Label>
                  <p className="text-sm text-muted-foreground">Enable usage of card outside of home country.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Contactless Payments</Label>
                  <p className="text-sm text-muted-foreground">NFC-based payments at terminals.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Card Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Credit Limit</span>
                <span className="font-medium">$15,000.00</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Available Credit</span>
                <span className="font-medium text-primary">$13,759.88</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-medium">14.99% APR</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 flex gap-4">
              <div className="p-2 bg-accent/10 rounded-lg h-fit">
                <BellRing className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-primary">Travel Notice</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Going abroad? Let us know to avoid transaction declines while you're traveling.
                </p>
                <Button variant="link" className="p-0 h-fit text-accent font-bold mt-2">
                  Add Travel Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start gap-3">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              Report Lost or Stolen
            </Button>
            <Button variant="secondary" className="w-full justify-start gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              Add to Apple Wallet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
