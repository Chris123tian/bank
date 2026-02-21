
"use client";

import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Smartphone, 
  Globe, 
  ChevronRight, 
  TrendingUp,
  Landmark,
  CircleDollarSign,
  Briefcase,
  ArrowRightLeft,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  Lock,
  ArrowRight,
  ShieldAlert,
  BarChart3,
  MousePointerClick
} from "lucide-react";
import LinkNext from "next/link";
import Image from "next/image";
import { useUser } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const { user } = useUser();
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-banking");
  const secureVaultImage = PlaceHolderImages.find(img => img.id === "secure-vault");

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-950 text-slate-50 selection:bg-accent/30 overflow-x-hidden">
      {/* Premium Navigation */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary p-2 rounded-xl transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]">
              <Building2 className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-headline font-black text-2xl tracking-tighter text-white leading-none">CITY BANK</span>
              <span className="text-[9px] font-black tracking-[0.3em] text-accent uppercase">International</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] uppercase tracking-widest font-black text-slate-400">
            <LinkNext href="#services" className="hover:text-white transition-colors">Wealth</LinkNext>
            <LinkNext href="#security" className="hover:text-white transition-colors">Security</LinkNext>
            <LinkNext href="/auth" className="hover:text-white transition-colors">Treasury</LinkNext>
            <LinkNext href="/auth" className="hover:text-white transition-colors">Institutional</LinkNext>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button className="bg-white text-primary hover:bg-slate-200 rounded-full px-7 h-11 text-xs font-bold" asChild>
                <LinkNext href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </LinkNext>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5" asChild>
                  <LinkNext href="/auth">Client Login</LinkNext>
                </Button>
                <Button className="bg-accent hover:bg-accent/90 rounded-full px-8 h-11 font-bold text-xs shadow-lg shadow-accent/20" asChild>
                  <LinkNext href="/auth?mode=signup">Open Account</LinkNext>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Cinematic Hero */}
        <section className="relative pt-24 pb-40 lg:pt-40 lg:pb-60 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.15),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-900/50 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent text-[9px] font-black tracking-widest uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tier-1 Global Liquidity Provider
                </div>
                <h1 className="text-7xl md:text-9xl font-headline font-black leading-[0.85] tracking-tighter animate-in fade-in slide-in-from-left-8 duration-1000">
                  Wealth <br />
                  <span className="text-accent italic">Without</span> <br />
                  Boundaries.
                </h1>
                <p className="text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                  The definitive platform for international capital. Experience a unified digital ecosystem designed for institutional-grade asset management and seamless global settlement.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 animate-in fade-in zoom-in-95 duration-1000 delay-500">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-sm px-10 h-16 rounded-2xl group shadow-2xl shadow-primary/20" asChild>
                    <LinkNext href={user ? "/dashboard" : "/auth?mode=signup"}>
                      Initialize My Assets <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </LinkNext>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-sm px-10 h-16 rounded-2xl" asChild>
                    <LinkNext href="#services">The Network</LinkNext>
                  </Button>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="relative z-10 rounded-[3rem] overflow-hidden border-[1px] border-white/10 shadow-4xl bg-slate-900 aspect-[4/5] lg:aspect-[3/4]">
                  <Image 
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/bank-hero/1200/1600"} 
                    alt="City Bank Experience" 
                    fill
                    priority
                    data-ai-hint="modern skyscraper"
                    className="object-cover opacity-80 transition-transform duration-[30s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>
                
                {/* Floating Stats */}
                <div className="absolute -bottom-10 -left-10 bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl animate-float">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                      <TrendingUp className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Reserve APY</p>
                      <p className="text-3xl font-black text-white leading-none mt-1">5.25%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Access Grid */}
        <section id="services" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-accent font-black tracking-[0.4em] uppercase text-[9px]">The Infrastructure</h2>
              <h3 className="text-5xl md:text-7xl font-headline font-black tracking-tighter">Unified Banking Protocol.</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Institutional Custody", desc: "Vault-grade security for your digital and fiat reserves.", icon: Lock },
                { title: "NexaSettlement", desc: "Instant cross-border transfers with zero latency.", icon: Zap },
                { title: "Global Treasury", desc: "Access 180+ markets from a single verified account.", icon: Globe },
                { title: "Wealth Intelligence", desc: "AI-driven portfolio insights and yield optimization.", icon: BarChart3 },
                { title: "Concierge Support", desc: "Priority 24/7 access to specialized banking agents.", icon: Smartphone },
                { title: "One-Click Liquidity", desc: "Instant credit lines backed by your diverse assets.", icon: MousePointerClick },
              ].map((item, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-accent/30 transition-all duration-500 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent transition-colors duration-500 mb-8">
                    <item.icon className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-xl font-black mb-3">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-24 bg-white text-slate-950 rounded-[4rem] mx-4 lg:mx-10 mb-20 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-10">
                <h3 className="text-5xl md:text-7xl font-headline font-black leading-tight tracking-tighter text-primary">Fortified <br />by Design.</h3>
                <p className="text-xl text-slate-600 font-medium leading-relaxed">
                  We leverage AES-256 encryption and multi-sig authorization protocols to ensure your capital is protected by the highest global security standards.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-primary">$420B+</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Total Assets Under Custody</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-primary">0.0ms</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Internal Settlement Latency</p>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 rounded-full px-10 h-14 font-black text-xs uppercase tracking-widest">
                  View Security Whitepaper
                </Button>
             </div>
             <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-slate-50">
               <Image 
                src={secureVaultImage?.imageUrl || "https://picsum.photos/seed/secure-vault/800/600"} 
                alt="Security Vault" 
                fill
                data-ai-hint="bank vault"
                className="object-cover"
               />
             </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Building2 className="text-accent h-8 w-8" />
            <span className="font-headline font-black text-3xl tracking-tighter">CITY BANK</span>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-4">The Standard in Global Finance</p>
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Compliance</span>
            <span>Sovereignty</span>
          </div>
          <p className="mt-12 text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">
            © 2024 City International Bank. Member FDIC. Equal Housing Lender.
          </p>
        </div>
      </footer>
    </div>
  );
}
