
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function DepositPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Card className="shadow-2xl border-t-4 border-t-accent text-center py-20">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Landmark className="h-12 w-12" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-black text-primary uppercase">Institutional Deposits</CardTitle>
          <CardDescription className="text-lg">This feature is currently undergoing regulatory review.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please contact your dedicated wealth manager or visit a City International Bank branch to perform capital injections while we finalize our digital settlement rails.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
