
"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User as UserIcon, 
  ShieldCheck, 
  Loader2, 
  CreditCard,
  Building2,
  Lock,
  Hash,
  Edit3,
  Save,
  X,
  Upload,
  ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Admin Detection
  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "roles_admin", user.uid);
  }, [db, user?.uid]);
  const { data: adminRole } = useDoc(adminRoleRef);
  const isMasterAdmin = user?.email === "citybank@gmail.com";
  const isAdmin = isMasterAdmin || !!adminRole;

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

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
        email: profile.email || user?.email || "",
        addressLine1: profile.addressLine1 || "",
        city: profile.city || "",
        state: profile.state || "",
        postalCode: profile.postalCode || "",
        country: profile.country || "United States",
        profilePictureUrl: profile.profilePictureUrl || "",
        signature: profile.signature || "",
      });
    }
  }, [profile, user?.email]);

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!db || !user?.uid) return;
    setSaving(true);
    const userRef = doc(db, "users", user.uid);
    setDocumentNonBlocking(userRef, {
      ...formData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your administrative records have been synchronized." });
    }, 800);
  };

  if (isProfileLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Vault Identity Record</h1>
            <p className="text-muted-foreground">Comprehensive global profile and regulatory identity overview.</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="h-11 font-bold">
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-primary h-11 font-bold">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Commit Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-accent h-11 font-black uppercase tracking-tighter shadow-lg">
                <Edit3 className="mr-2 h-4 w-4" /> Edit My Profile
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#E5E7EB] rounded-3xl p-8 sm:p-12 shadow-inner border border-slate-200 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-slate-400">
              <Lock className="h-5 w-5" />
            </div>
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="relative inline-block">
                <h2 className="text-3xl font-bold text-[#002B5B] tracking-tight uppercase">Basic Information</h2>
                <div className="absolute -bottom-2 left-0 h-1.5 w-20 bg-[#2563EB]" />
              </div>

              <div className="flex flex-col items-center gap-8">
                <div className="relative group">
                  <div className="h-56 w-56 rounded-full bg-[#FFA07A] flex items-center justify-center overflow-hidden shadow-lg border-8 border-slate-100 shrink-0">
                    {formData.profilePictureUrl ? (
                      <img src={formData.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-white text-7xl font-bold">{formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}</span>
                    )}
                  </div>
                  {isAdmin && isEditing && (
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-8 w-8 mb-2" />
                      <span className="text-xs font-bold uppercase">Change Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profilePictureUrl')} />
                    </label>
                  )}
                </div>
                
                <div className="text-center space-y-4 w-full">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#002B5B] rounded-full text-white shadow-lg">
                    <Hash className="h-4 w-4 text-accent" />
                    <span className="text-sm font-black tracking-widest uppercase">ID: {profile?.accountNumber || "CITY-PENDING"}</span>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500">First Name</Label>
                          <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="h-11 bg-white" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500">Last Name</Label>
                          <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="h-11 bg-white" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-500">Username</Label>
                          <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="h-11 bg-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-slate-700">
                          <span className="font-black text-[#002B5B]">Username:</span> {formData.username || "Member"}
                        </p>
                        <p className="text-xl font-bold text-slate-700">
                          <span className="font-black text-[#002B5B]">Email:</span> <span className="underline underline-offset-4 decoration-slate-400">{formData.email}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-12 border-t border-slate-300 text-xl text-slate-700">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Street Address</Label>
                      <Input value={formData.addressLine1} onChange={(e) => setFormData({...formData, addressLine1: e.target.value})} className="h-11 bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">City</Label>
                        <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="h-11 bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-500">Jurisdiction (Country)</Label>
                        <Input value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="h-11 bg-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <span className="font-black text-[#002B5B] min-w-[160px]">Name :</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-black text-[#002B5B] min-w-[160px]">Jurisdiction:</span>
                      <span className="font-medium">{formData.country}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-black text-[#002B5B] min-w-[160px]">Address 1:</span>
                      <span className="font-medium">{formData.addressLine1 || "No address on file"}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-black text-[#002B5B] min-w-[160px]">City/State/Zip:</span>
                      <span className="font-medium">{formData.city ? `${formData.city}, ${formData.state || ''} ${formData.postalCode || ''}` : '—'}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-16 pb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#002B5B] mb-4 text-center">Authorized Regulatory Signature</p>
                <div className="bg-white p-6 inline-block shadow-md rounded-xl border border-slate-100 mx-auto w-full max-w-sm relative group">
                  {formData.signature ? (
                    <img src={formData.signature} alt="Signature" className="h-24 object-contain mx-auto" />
                  ) : (
                    <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-300 text-[10px] uppercase font-black">
                      No Signature Authorized
                    </div>
                  )}
                  {isAdmin && isEditing && (
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Update Signature</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'signature')} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {!isAdmin && (
            <Card className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2rem] text-center">
              <CardTitle className="text-primary mb-2 flex items-center justify-center gap-2">
                <Lock className="h-5 w-5" /> Institutional Lockdown Active
              </CardTitle>
              <CardDescription className="font-medium max-w-lg mx-auto leading-relaxed">
                To maintain the highest security standards, your identity records are managed by your assigned Banking Administrator. All profile modifications must be requested through institutional support.
              </CardDescription>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-primary/10 shadow-xl overflow-hidden rounded-3xl">
            <CardHeader className="bg-primary text-white p-6">
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> Account Summary</CardTitle>
              <CardDescription className="text-white/70">Consolidated institutional capital.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-8 bg-primary/5 border-b border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Asset Value</p>
                <p className="text-4xl font-black text-primary mt-1">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-6 space-y-4">
                {isAccountsLoading ? (
                  Array(2).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />)
                ) : accounts && accounts.length > 0 ? accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">{acc.accountType}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">...{acc.accountNumber?.slice(-4)}</p>
                      </div>
                    </div>
                    <p className="font-black text-sm">${acc.balance?.toLocaleString()}</p>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-4 italic">No active accounts detected.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xs font-black text-accent uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-accent/10">
                <span className="text-xs font-bold">KYC Identity</span>
                <Badge className="bg-green-100 text-green-700 border-none px-3">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-accent/10">
                <span className="text-xs font-bold">AML Tier</span>
                <Badge className="bg-blue-100 text-blue-700 border-none px-3">Tier 1</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
