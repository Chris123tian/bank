"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, ShieldCheck, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await updateProfile(user, { displayName: name });
      toast({
        title: "Profile Updated",
        description: "Your display name has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <UserIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Account Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>This information is visible across your banking dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user?.email || ""} disabled className="bg-slate-50" />
            <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verified secure global identifier
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Alex Thompson" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 justify-end">
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-red-100 bg-red-50/20">
        <CardHeader>
          <CardTitle className="text-red-600 text-lg">Security Zones</CardTitle>
          <CardDescription>Highly sensitive account operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-lg">
            <div>
              <p className="font-bold text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Enabled via NexaSecure Device Link</p>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Protected</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}