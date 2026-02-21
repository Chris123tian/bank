
"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc, serverTimestamp, collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  User as UserIcon, 
  ShieldCheck, 
  Loader2, 
  MapPin, 
  PenTool, 
  CreditCard,
  Building2,
  Mail,
  Camera,
  Globe,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Profile data fetch
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Accounts fetch for Summary
  const accountsRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]);

  const { data: accounts, isLoading: isAccountsLoading } = useCollection(accountsRef);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    profilePictureUrl: "",
    firstName: "",
    lastName: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    signature: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        profilePictureUrl: profile.profilePictureUrl || user?.photoURL || "",
        firstName: profile.firstName || user?.displayName?.split(' ')[0] || "",
        lastName: profile.lastName || user?.displayName?.split(' ')[1] || "",
        email: profile.email || user?.email || "",
        addressLine1: profile.addressLine1 || "",
        addressLine2: profile.addressLine2 || "",
        city: profile.city || "",
        state: profile.state || "",
        postalCode: profile.postalCode || "",
        country: profile.country || "",
        signature: profile.signature || "",
      });
    }
  }, [profile, user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'signature') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB Limit for Base64 prototype storage
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 1MB for verification."
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      toast({
        title: "Image Uploaded",
        description: `Successfully processed ${field === 'signature' ? 'handwritten signature' : 'profile image'}.`
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!user || !db) return;
    setLoading(true);

    try {
      // Update Firebase Auth Profile (Display Name)
      await updateProfile(user, { 
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        photoURL: formData.profilePictureUrl 
      });

      // Update Firestore Profile
      const userDocRef = doc(db, "users", user.uid);
      setDocumentNonBlocking(userDocRef, {
        ...formData,
        id: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: "Profile Synchronized",
        description: "Your basic information has been updated across all systems.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile information.",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

  if (isProfileLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Account User Information</h1>
            <p className="text-muted-foreground">Manage your secure global profile and financial identity.</p>
          </div>
        </div>
        <Button onClick={handleUpdateProfile} disabled={loading} className="bg-accent hover:bg-accent/90">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save All Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Basic Information
              </CardTitle>
              <CardDescription>Personal identification and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-xl overflow-hidden">
                    <AvatarImage src={formData.profilePictureUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="text-white h-6 w-6" />
                  </button>
                  <input 
                    type="file" 
                    ref={profileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'profilePictureUrl')} 
                  />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input 
                        placeholder="@username" 
                        value={formData.username} 
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Identity Status</Label>
                      <div className="h-10 px-3 flex items-center bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-100">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Verified Profile
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-10"
                    type="email" 
                    value={formData.email} 
                    disabled 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-bold text-sm flex items-center gap-2 text-primary">
                  <MapPin className="h-4 w-4 text-accent" />
                  Residential Address
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Address Line 1</Label>
                      <Input 
                        placeholder="Street address, P.O. box" 
                        value={formData.addressLine1} 
                        onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address Line 2 (Optional)</Label>
                      <Input 
                        placeholder="Apt, unit, floor" 
                        value={formData.addressLine2} 
                        onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input 
                        value={formData.city} 
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State / Province</Label>
                      <Input 
                        value={formData.state} 
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postal Code</Label>
                      <Input 
                        value={formData.postalCode} 
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-10"
                        placeholder="United States" 
                        value={formData.country} 
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-primary">
                    <PenTool className="h-4 w-4 text-accent" />
                    Handwritten Signature
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => signatureInputRef.current?.click()}
                  >
                    <Upload className="h-3 w-3 mr-2" /> Upload Image
                  </Button>
                  <input 
                    type="file" 
                    ref={signatureInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'signature')} 
                  />
                </div>
                <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center min-h-[120px]">
                  {formData.signature ? (
                    <div className="relative group w-full flex justify-center">
                      <img src={formData.signature} alt="Digital Signature" className="max-h-24 object-contain mix-blend-multiply" />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                        <Button variant="secondary" size="sm" onClick={() => setFormData(prev => ({ ...prev, signature: '' }))}>Clear</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">No Signature Image Uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/10 shadow-lg overflow-hidden">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Summary
              </CardTitle>
              <CardDescription className="text-white/70">Consolidated financial overview.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 bg-primary/5 border-b border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Managed Capital</p>
                <p className="text-4xl font-black text-primary mt-1">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-6 space-y-4">
                {isAccountsLoading ? (
                  Array(2).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />)
                ) : accounts && accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{acc.accountType}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">...{acc.accountNumber?.slice(-8)}</p>
                        </div>
                      </div>
                      <p className="font-black text-sm text-right">
                        ${acc.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 opacity-40">
                    <p className="text-xs font-bold uppercase tracking-tighter">No Linked Accounts Found</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full text-xs" asChild>
                <a href="/dashboard/accounts/new">Open Supplemental Account</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-accent uppercase tracking-widest">Security Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-accent/10 shadow-sm">
                <span className="text-xs font-medium">KYC Verification</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-accent/10 shadow-sm">
                <span className="text-xs font-medium">Account Status</span>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
