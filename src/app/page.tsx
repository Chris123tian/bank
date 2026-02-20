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
  ArrowRight
} from "lucide-react";
import LinkNext from "next/link";
import Image from "next/image";
import { useUser } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const { user } = useUser();
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-banking");
  const mobileAppImage = PlaceHolderImages.find(img => img.id === "mobile-app");

  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-foreground selection:bg-accent/30 overflow-x-hidden">
      {/* Premium Glass Navbar */}
      <nav className="border-b bg-white/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary p-2.5 rounded-2xl transition-all duration-500 group-hover:rotate-[360deg] group-hover:shadow-2xl group-hover:shadow-primary/40">
              <Building2 className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-headline font-black text-2xl tracking-tighter text-primary leading-none">CITY BANK</span>
              <span className="text-[9px] font-black tracking-[0.3em] text-accent uppercase opacity-90">International</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-12 text-[11px] uppercase tracking-widest font-black text-primary/60">
            <LinkNext href="#services" className="hover:text-primary hover:scale-105 transition-all">Services</LinkNext>
            <LinkNext href="#global" className="hover:text-primary hover:scale-105 transition-all">Treasury</LinkNext>
            <LinkNext href="/auth" className="hover:text-primary hover:scale-105 transition-all">Commercial</LinkNext>
            <LinkNext href="/auth" className="hover:text-primary hover:scale-105 transition-all">Wealth</LinkNext>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button className="bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 rounded-full px-7 h-12 text-sm font-bold" asChild>
                <LinkNext href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </LinkNext>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex text-primary font-black uppercase tracking-widest text-[11px] hover:bg-slate-50" asChild>
                  <LinkNext href="/auth">Sign In</LinkNext>
                </Button>
                <Button className="bg-accent hover:bg-accent/90 shadow-2xl shadow-accent/30 rounded-full px-10 h-14 font-bold text-base transition-all active:scale-95" asChild>
                  <LinkNext href="/auth?mode=signup">Open Account</LinkNext>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Cinematic Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-48 bg-slate-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary/5 to-transparent -skew-x-12 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-accent/10 text-accent text-[11px] font-black tracking-[0.15em] uppercase border border-accent/20 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                  <ShieldCheck className="h-4 w-4" />
                  Institutional Grade Infrastructure
                </div>
                <h1 className="text-7xl md:text-9xl font-headline font-black leading-[0.85] tracking-tighter text-primary animate-in fade-in slide-in-from-left-10 duration-1000">
                  Redefining <br />
                  <span className="text-accent italic drop-shadow-sm underline decoration-primary/5">Wealth.</span>
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                  The world's most sophisticated digital banking platform. High-yield assets, multi-currency liquidity, and automated wealth management for the global elite.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 pt-6 animate-in fade-in zoom-in-95 duration-1000 delay-500">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-12 h-20 rounded-3xl shadow-3xl shadow-primary/30 transition-all hover:-translate-y-2 group" asChild>
                    <LinkNext href={user ? "/dashboard" : "/auth?mode=signup"}>
                      Initialize Account <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </LinkNext>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-slate-200 text-lg px-12 h-20 rounded-3xl bg-white hover:bg-slate-50 transition-all hover:-translate-y-2" asChild>
                    <LinkNext href="#services">View Portfolios</LinkNext>
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-12 border-t border-slate-200/60 mt-12 opacity-60">
                  <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-wider text-primary"><Zap className="h-5 w-5 text-accent fill-accent" /> Real-Time Settlement</div>
                  <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-wider text-primary"><Lock className="h-5 w-5 text-accent" /> AES-256 Vault</div>
                  <div className="flex items-center gap-3 font-black text-[11px] uppercase tracking-wider text-primary"><Globe className="h-5 w-5 text-accent" /> 180+ Jurisdictions</div>
                </div>
              </div>

              <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_80px_120px_-30px_rgba(26,35,126,0.4)] border-[12px] border-white bg-slate-200 aspect-[4/5] lg:aspect-[4/3]">
                  <Image 
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/citybank1/1200/800"} 
                    alt="City Bank Experience" 
                    fill
                    data-ai-hint="digital banking"
                    className="object-cover transition-transform duration-10000 hover:scale-110"
                  />
                </div>
                
                <div className="absolute -bottom-12 -left-12 bg-white/90 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl z-20 border border-white/50 animate-bounce-slow">
                  <div className="flex items-center gap-5">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-3xl text-white shadow-xl shadow-green-200">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Portfolio Growth</p>
                      <p className="text-4xl font-black text-primary leading-none mt-1">5.25% <span className="text-sm font-bold opacity-40">APY</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section id="services" className="py-40 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32">
              <div className="space-y-6 text-center lg:text-left">
                <h2 className="text-accent font-black tracking-[0.3em] uppercase text-xs">Premium Ecosystem</h2>
                <h3 className="text-6xl md:text-7xl font-headline font-black text-primary tracking-tight leading-tight">Master your capital <br />without boundaries.</h3>
              </div>
              <p className="text-lg text-muted-foreground/70 max-w-md text-center lg:text-right font-medium leading-relaxed">
                From institutional liquidity to automated wealth strategies, we deploy the world's most advanced tools for your financial legacy.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { title: "Private Banking", desc: "Borderless accounts with zero maintenance fees and maximum privacy.", icon: Landmark },
                { title: "Algorithmic Wealth", desc: "AI-driven market insights and human expertise for aggressive growth.", icon: CircleDollarSign },
                { title: "Enterprise Capital", desc: "Scale multinational operations with multi-currency payroll and credit.", icon: Briefcase },
                { title: "NexaNetwork", desc: "Instant cross-border transfers with zero settlement latency or fees.", icon: ArrowRightLeft },
              ].map((service, idx) => (
                <div key={idx} className="group p-12 rounded-[3rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-accent/10 hover:shadow-3xl transition-all duration-700 space-y-8 cursor-default">
                  <div className="h-20 w-20 rounded-[2rem] bg-white flex items-center justify-center group-hover:bg-primary transition-all duration-500 shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/30 group-hover:-rotate-12">
                    <service.icon className="h-10 w-10 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-primary tracking-tight leading-none">{service.title}</h4>
                    <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed">{service.desc}</p>
                  </div>
                  <Button variant="link" className="p-0 text-accent font-black uppercase tracking-widest text-[11px] h-auto group-hover:translate-x-3 transition-transform">
                    Initialize Protocol <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* High-Impact App Promo */}
        <section className="py-32 bg-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-4xl border-[16px] border-white/5 rotate-[-2deg]">
                  <Image 
                    src={mobileAppImage?.imageUrl || "https://picsum.photos/seed/citybank2/1200/1600"} 
                    alt="Mobile Banking" 
                    width={600} 
                    height={800}
                    data-ai-hint="mobile banking"
                    className="w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="absolute -top-20 -right-20 h-64 w-64 bg-accent/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-white/10 rounded-full blur-[100px] animate-pulse" />
              </div>
              <div className="order-1 lg:order-2 space-y-10">
                <h3 className="text-6xl md:text-7xl font-headline font-black leading-tight tracking-tighter">Your bank, <br /><span className="text-accent italic">elevated.</span></h3>
                <p className="text-2xl text-primary-foreground/60 font-medium leading-relaxed">
                  Total dominance over your assets, anywhere in the world. Our award-winning terminal gives you sovereign control over your global liquidity.
                </p>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <p className="text-5xl font-black text-accent tracking-tighter">99.99%</p>
                    <p className="text-[11px] uppercase font-black tracking-[0.2em] opacity-50">Settlement Uptime</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-5xl font-black text-accent tracking-tighter">Quantum</p>
                    <p className="text-[11px] uppercase font-black tracking-[0.2em] opacity-50">Encryption Grade</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 pt-6">
                  <div className="h-16 w-56 bg-white text-primary rounded-3xl flex items-center justify-center border border-white/20 hover:bg-accent hover:text-white transition-all duration-500 cursor-pointer shadow-xl">
                    <Smartphone className="mr-3 h-6 w-6" />
                    <span className="font-black text-xs uppercase tracking-widest">App Store</span>
                  </div>
                  <div className="h-16 w-56 bg-white/10 text-white rounded-3xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-500 cursor-pointer">
                    <Smartphone className="mr-3 h-6 w-6" />
                    <span className="font-black text-xs uppercase tracking-widest">Google Play</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-white pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-40">
            <div className="col-span-1 md:col-span-2 space-y-10">
              <div className="flex items-center gap-4">
                <div className="bg-accent p-3 rounded-2xl shadow-2xl shadow-accent/20">
                  <Building2 className="text-white h-8 w-8" />
                </div>
                <span className="font-headline font-black text-4xl tracking-tighter text-white">CITY BANK</span>
              </div>
              <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
                The world's most trusted partner for global capital. Regulated by international standards and built for the next century of finance.
              </p>
              <div className="flex gap-6">
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all cursor-pointer group">
                  <Globe className="h-6 w-6 text-slate-400 group-hover:text-white" />
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all cursor-pointer group">
                  <ShieldCheck className="h-6 w-6 text-slate-400 group-hover:text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <h4 className="font-black text-[11px] uppercase tracking-[0.4em] text-accent">Liquidity</h4>
              <ul className="space-y-5 text-base font-bold text-slate-400">
                <li><LinkNext href="/auth" className="hover:text-white transition-colors flex items-center gap-2 group">Premier Checking <ArrowRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all opacity-0 group-hover:opacity-100" /></LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors flex items-center gap-2 group">High-Yield Treasury <ArrowRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all opacity-0 group-hover:opacity-100" /></LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors flex items-center gap-2 group">Wealth Portfolios <ArrowRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all opacity-0 group-hover:opacity-100" /></LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors flex items-center gap-2 group">Private Trust <ArrowRight className="h-0 w-0 group-hover:h-4 group-hover:w-4 transition-all opacity-0 group-hover:opacity-100" /></LinkNext></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="font-black text-[11px] uppercase tracking-[0.4em] text-accent">Protocol</h4>
              <ul className="space-y-5 text-base font-bold text-slate-400">
                <li><LinkNext href="#" className="hover:text-white transition-colors">Concierge Center</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">Legal Framework</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">Vault Security</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">API Endpoint</LinkNext></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">
            <p>© 2024 City International Bank. Member FDIC. Equal Housing Lender.</p>
            <div className="flex gap-12">
              <span className="text-green-500 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Network: Operational</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Sovereignty</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
