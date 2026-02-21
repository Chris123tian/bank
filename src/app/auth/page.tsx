"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { initiateEmailSignIn, initiateEmailSignUp, initiateGoogleSignIn } from "@/firebase/non-blocking-login";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { t } = useTranslation();

  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      setLoading(true);
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

  const handleGoogleSignIn = () => {
    setLoading(true);
    initiateGoogleSignIn(auth);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>
      
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="bg-primary p-2 rounded-lg">
          <Building2 className="text-white h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="font-headline font-black text-xl sm:text-2xl tracking-tighter text-primary leading-none">CITY BANK</span>
          <span className="text-[7px] sm:text-[8px] font-black tracking-[0.2em] text-accent uppercase">International</span>
        </div>
      </Link>

      <Card className="w-full max-w-[400px] shadow-xl border-t-4 border-t-accent overflow-hidden">
        <CardHeader className="space-y-1 text-center p-6 sm:p-8">
          <CardTitle className="text-xl sm:text-2xl font-bold">{isLogin ? t('auth_signin') : t('auth_signup')}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isLogin ? t('auth_desc_login') : t('auth_desc_signup')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 sm:h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 sm:h-11"
              />
            </div>
            {email === "citybank@gmail.com" && (
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-accent/10 border border-accent/20 rounded-lg text-[10px] sm:text-xs font-bold text-accent">
                <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                Administrator Login Detected
              </div>
            )}
            <Button className="w-full bg-primary hover:bg-primary/90 h-11 sm:h-12" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Log In" : "Register"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-11 sm:h-12 flex items-center justify-center gap-2 text-xs sm:text-sm" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-0 p-6 sm:p-8 border-t bg-slate-50/50">
          <div className="text-center text-xs sm:text-sm">
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
      </Card>
      
      <div className="mt-8 text-center max-w-sm space-y-2 px-4">
        <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-black">
          Global Security Standards • 256-bit Encryption
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          © 2024 City International Bank. Member FDIC. Equal Housing Lender.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
