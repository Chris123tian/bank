
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Landmark, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  User as UserIcon, 
  Briefcase, 
  ShieldCheck, 
  FileText,
  Upload,
  ArrowLeft,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function NewAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { data: accounts } = useCollection(useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "accounts");
  }, [db, user?.uid]));

  // Form State
  const [formData, setFormData] = useState({
    // Personal & Identity
    firstName: user?.displayName?.split(' ')[0] || "",
    lastName: user?.displayName?.split(' ')[1] || "",
    dob: "",
    ssn: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    // Employment
    employmentStatus: "Full-Time",
    employerName: "",
    jobTitle: "",
    annualIncome: "",
    // Account
    accountType: "Current Account",
    initialDeposit: "100",
    signature: "",
    transactionCode: Math.floor(100000 + Math.random() * 900000).toString()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOnboardingComplete = async () => {
    if (!user || !db) return;

    // REGULATORY RESTRICTION: One Current Account per client
    if (formData.accountType === "Current Account") {
      const hasCurrent = accounts?.some(acc => acc.accountType === "Current Account");
      if (hasCurrent) {
        toast({
          variant: "destructive",
          title: "Regulatory Constraint",
          description: "You already have an active Current Account. Multiple daily operations accounts are not permitted."
        });
        return;
      }
    }

    setLoading(true);

    // 1. Update Customer Profile with identity details
    const userRef = doc(db, "users", user.uid);
    setDocumentNonBlocking(userRef, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      ssn: formData.ssn,
      phoneNumber: formData.phoneNumber,
      addressLine1: formData.addressLine1,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      employmentStatus: formData.employmentStatus,
      employerName: formData.employerName,
      jobTitle: formData.jobTitle,
      annualIncome: Number(formData.annualIncome),
      signature: formData.signature,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 2. Create the Account
    const accountsRef = collection(db, "users", user.uid, "accounts");
    const accountData = {
      accountNumber: `CITY-${Math.floor(10000000 + Math.random() * 90000000)}`,
      accountType: formData.accountType,
      balance: Number(formData.initialDeposit),
      currency: "USD",
      transactionCode: formData.transactionCode,
      customerId: user.uid,
      userId: user.uid,
      status: "Active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    addDocumentNonBlocking(accountsRef, accountData);
    
    setTimeout(() => {
      toast({ 
        title: "Institutional Account Initialized", 
        description: `Welcome to City Bank Global. Your ${formData.accountType} is now active.` 
      });
      router.push("/dashboard");
    }, 1500);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary p-3 rounded-2xl text-white shadow-lg">
          <Landmark className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Onboarding Protocol</h1>
          <p className="text-muted-foreground text-sm">Step {step} of 4: {
            step === 1 ? "Personal Identity" : 
            step === 2 ? "Employment & Financials" : 
            step === 3 ? "Account Selection" : "Authorization"
          }</p>
        </div>
      </div>

      <Card className="shadow-2xl border-t-4 border-t-accent overflow-hidden">
        <CardContent className="pt-8 space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                <UserIcon className="h-5 w-5" /> Legal Identity Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="As per ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="As per ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN / Tax ID</Label>
                  <Input id="ssn" value={formData.ssn} onChange={handleInputChange} placeholder="XXX-XX-XXXX" />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Residential Address</h4>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Street Address</Label>
                  <Input id="addressLine1" value={formData.addressLine1} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={formData.state} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Zip Code</Label>
                    <Input id="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                <Briefcase className="h-5 w-5" /> Employment & Source of Funds
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(v) => handleSelectChange("employmentStatus", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-Time">Full-Time Employee</SelectItem>
                      <SelectItem value="Part-Time">Part-Time Employee</SelectItem>
                      <SelectItem value="Self-Employed">Self-Employed / Founder</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employerName">Employer Name</Label>
                    <Input id="employerName" value={formData.employerName} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Household Income (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="annualIncome" type="number" className="pl-7" value={formData.annualIncome} onChange={handleInputChange} placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" /> Account Preferences
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type of Account</Label>
                  <Select value={formData.accountType} onValueChange={(v) => handleSelectChange("accountType", v)}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Current Account">Current Account (Daily Ops)</SelectItem>
                      <SelectItem value="Savings Account">Savings Account (5.25% APY)</SelectItem>
                      <SelectItem value="Business Account">Business Account (Corporate)</SelectItem>
                      <SelectItem value="Internet Banking">Internet Banking (Digital Only)</SelectItem>
                      <SelectItem value="Safety Deposits">Safety Deposits (Vault Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialDeposit">Initial Capital Injection (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                      <Input id="initialDeposit" type="number" className="pl-8 h-12 text-lg font-black" value={formData.initialDeposit} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Key className="h-3 w-3" /> Transaction Code</Label>
                    <Input 
                      id="transactionCode" 
                      value={formData.transactionCode} 
                      onChange={handleInputChange} 
                      className="h-12 font-mono text-center text-lg font-black tracking-widest bg-slate-50"
                      placeholder="6-digit code"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Minimum Deposit: $100.00 • Save your code for authorizing transfers.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" /> Legal Authorization & Consent
              </h3>
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-black tracking-widest text-slate-500">Upload Legal Signature Image</Label>
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-white hover:border-primary transition-colors cursor-pointer relative group">
                    {formData.signature ? (
                      <div className="w-full h-32 flex items-center justify-center">
                        <img src={formData.signature} alt="Signature" className="max-h-full object-contain" />
                        <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-xs" onClick={() => setFormData(p => ({...p, signature: ""}))}>Remove</Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-bold text-slate-500">Click to upload signature (PNG/JPG)</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-3 pt-4 text-[10px] font-medium text-slate-600 leading-relaxed uppercase tracking-tighter">
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    I hereby certify that all information provided is accurate and corresponds to my legal identification.
                  </p>
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    I agree to the City Bank Global Privacy Policy and Institutional Disclosure.
                  </p>
                </div>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 bg-slate-50/50">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep} className="h-12 px-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : <div />}
          
          {step < 4 ? (
            <Button onClick={nextStep} className="bg-primary h-12 px-10 font-bold">
              Continue Onboarding <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleOnboardingComplete} disabled={loading || !formData.signature} className="bg-accent h-12 px-10 font-black shadow-xl">
              {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Finalize Authorization"}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <p className="text-[9px] text-center text-muted-foreground mt-8 uppercase font-black tracking-widest leading-tight px-12">
        City Bank Global is regulated by the Federal Banking Authority. All data is protected by AES-256 institutional-grade encryption.
      </p>
    </div>
  );
}
