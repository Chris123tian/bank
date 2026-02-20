"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      setLoading(true);
      // Ensure administrative privileges are active for the prototype admin
      if (user.email === "citybank@gmail.com") {
        const adminRef = doc(db, "roles_admin", user.uid);
        setDoc(adminRef, { 
          email: user.email, 
          assignedAt: serverTimestamp(),
          role: "super_admin"
        }, { merge: true }).then(() => {
          router.push("/dashboard");
        }).catch(() => {
          router.push("/dashboard");
        });
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, isUserLoading, router, db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        initiateEmailSignIn(auth, email, password);
      } else {
        initiateEmailSignUp(auth, email, password);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Failed to authenticate.",
      });
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="bg-primary p-2 rounded-lg">
          <Building2 className="text-white h-6 w-6" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="font-headline font-black text-2xl tracking-tighter text-primary leading-none">CITY BANK</span>
          <span className="text-[8px] font-black tracking-[0.2em] text-accent uppercase">International</span>
        </div>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-accent">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{isLogin ? "Sign In" : "Join City Bank"}</CardTitle>
          <CardDescription>
            {isLogin 
              ? "Access your secure global banking dashboard." 
              : "Experience the future of finance today."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {email === "citybank@gmail.com" && (
              <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs font-bold text-accent">
                <ShieldCheck className="h-4 w-4" />
                Administrator Login Detected
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-primary hover:bg-primary/90 py-6" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Log In to Secure Dashboard" : "Create My Global Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center text-sm">
              {isLogin ? (
                <span>
                  New to City Bank?{" "}
                  <button type="button" onClick={() => setIsLogin(false)} className="text-accent font-bold hover:underline">
                    Get Started Now
                  </button>
                </span>
              ) : (
                <span>
                  Already a member?{" "}
                  <button type="button" onClick={() => setIsLogin(true)} className="text-accent font-bold hover:underline">
                    Log In
                  </button>
                </span>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-8 text-center max-w-sm space-y-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
          Global Security Standards • 256-bit Encryption
        </p>
        <p className="text-xs text-muted-foreground">
          © 2024 City International Bank. Member FDIC. Equal Housing Lender.
        </p>
      </div>
    </div>
  );
}