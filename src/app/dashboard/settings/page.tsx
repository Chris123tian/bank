
"use client";

import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  ShieldCheck, 
  Loader2, 
  CreditCard,
  Building2,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();

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

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

  if (isProfileLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const profileData = {
    username: profile?.username || user?.email?.split('@')[0] || "N/A",
    profilePictureUrl: profile?.profilePictureUrl || user?.photoURL || "",
    firstName: profile?.firstName || user?.displayName?.split(' ')[0] || "N/A",
    lastName: profile?.lastName || user?.displayName?.split(' ')[1] || "N/A",
    email: profile?.email || user?.email || "N/A",
    addressLine1: profile?.addressLine1 || "—",
    addressLine2: profile?.addressLine2 || "—",
    city: profile?.city || "",
    state: profile?.state || "",
    postalCode: profile?.postalCode || "",
    country: profile?.country || "—",
    signature: profile?.signature || "",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Account User Information</h1>
            <p className="text-muted-foreground">Secure global profile and financial identity overview.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-inner border border-slate-200">
            <div className="max-w-md mx-auto space-y-12">
              <div className="relative inline-block">
                <h2 className="text-3xl font-bold text-[#002B5B] tracking-tight">Basic Information</h2>
                <div className="absolute -bottom-2 left-0 h-1.5 w-20 bg-[#2563EB]" />
              </div>

              <div className="flex justify-center pt-4">
                <div className="h-64 w-64 rounded-full bg-[#FFA07A] flex items-center justify-center overflow-hidden shadow-lg border-8 border-slate-100">
                  {profileData.profilePictureUrl ? (
                    <img 
                      src={profileData.profilePictureUrl} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-7xl font-bold">
                      {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex gap-2 text-xl text-slate-700">
                  <span className="font-bold min-w-[120px]">Username:</span>
                  <span className="font-medium">{profileData.username}</span>
                </div>
                
                <div className="flex gap-2 text-xl text-slate-700">
                  <span className="font-bold min-w-[120px]">Email:</span>
                  <span className="font-medium underline decoration-1 underline-offset-4">{profileData.email}</span>
                </div>

                <div className="pt-12 space-y-5">
                  <div className="flex gap-2 text-xl text-slate-700">
                    <span className="font-bold min-w-[160px]">Name :</span>
                    <span className="font-medium">{profileData.firstName} {profileData.lastName}</span>
                  </div>

                  <div className="flex gap-2 text-xl text-slate-700">
                    <span className="font-bold min-w-[160px]">Address 1:</span>
                    <span className="font-medium">{profileData.addressLine1}</span>
                  </div>

                  <div className="flex gap-2 text-xl text-slate-700">
                    <span className="font-bold min-w-[160px]">Address 2:</span>
                    <span className="font-medium">{profileData.addressLine2}</span>
                  </div>

                  <div className="flex gap-2 text-xl text-slate-700">
                    <span className="font-bold min-w-[160px]">City/State/Zip:</span>
                    <span className="font-medium">
                      {profileData.city}{profileData.state ? `, ${profileData.state}` : ''}{profileData.postalCode ? ` ${profileData.postalCode}` : ''}
                      {!profileData.city && !profileData.state && "—"}
                    </span>
                  </div>

                  <div className="flex gap-2 text-xl text-slate-700">
                    <span className="font-bold min-w-[160px]">Country:</span>
                    <span className="font-medium">{profileData.country}</span>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8">
                <div className="bg-white p-4 inline-block shadow-md rounded-md">
                  {profileData.signature ? (
                    <img src={profileData.signature} alt="Signature" className="h-20 object-contain" />
                  ) : (
                    <div className="h-20 w-48 flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-300 text-[10px] uppercase font-black">
                      No Signature
                    </div>
                  )}
                </div>
                <div className="mt-4 h-1 w-full bg-slate-300 rounded-full opacity-50" />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Profile information is managed by your assigned Banking Administrator. Please contact support for identity updates.
            </p>
          </div>
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
