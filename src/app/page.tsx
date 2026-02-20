
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
  ExternalLink,
  ShieldAlert
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
      {/* Modern High-Performance Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-300">
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
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-widest font-black text-primary/60">
            <LinkNext href="#services" className="hover:text-primary hover:scale-105 transition-all">Wealth</LinkNext>
            <LinkNext href="#global" className="hover:text-primary hover:scale-105 transition-all">Treasury</LinkNext>
            <LinkNext href="/auth" className="hover:text-primary hover:scale-105 transition-all">Commercial</LinkNext>
            <LinkNext href="/auth" className="hover:text-primary hover:scale-105 transition-all">Institutional</LinkNext>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button className="bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 rounded-full px-7 h-12 text-sm font-bold" asChild>
                <LinkNext href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </LinkNext>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex text-primary font-black uppercase tracking-widest text-[11px] hover:bg-slate-50" asChild>
                  <LinkNext href="/auth">Sign In</LinkNext>
                </Button>
                <Button className="bg-accent hover:bg-accent/90 shadow-2xl shadow-accent/30 rounded-full px-8 h-12 font-bold text-sm transition-all active:scale-95" asChild>
                  <LinkNext href="/auth?mode=signup">Open Account</LinkNext>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Cinematic Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 bg-slate-50 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary/5 to-transparent -skew-x-12 translate-x-32" />
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[120px] animate-pulse" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-xl shadow-slate-200/50 text-accent text-[10px] font-black tracking-[0.2em] uppercase border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700">
                  <ShieldCheck className="h-4 w-4" />
                  Institutional Security Standards
                </div>
                <h1 className="text-6xl md:text-8xl font-headline font-black leading-[0.9] tracking-tighter text-primary animate-in fade-in slide-in-from-left-10 duration-1000">
                  The Future of <br />
                  <span className="text-accent italic">Global Wealth.</span>
                </h1>
                <p className="text-xl text-muted-foreground/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                  Experience institutional-grade liquidity and award-winning digital assets management. Built for the modern visionary who demands excellence without boundaries.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 pt-4 animate-in fade-in zoom-in-95 duration-1000 delay-500">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-10 h-16 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 group" asChild>
                    <LinkNext href={user ? "/dashboard" : "/auth?mode=signup"}>
                      Get Started <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </LinkNext>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-slate-200 text-lg px-10 h-16 rounded-2xl bg-white hover:bg-slate-50 transition-all hover:-translate-y-1" asChild>
                    <LinkNext href="#services">Learn More</LinkNext>
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-200/60 mt-10 opacity-70">
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"><Zap className="h-4 w-4 text-accent fill-accent" /> Instant Settlement</div>
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"><Lock className="h-4 w-4 text-accent" /> AES-256 Vault</div>
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-primary"><Globe className="h-4 w-4 text-accent" /> 180+ Markets</div>
                </div>
              </div>

              {/* Hero Image Component */}
              <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(26,35,126,0.3)] border-[8px] border-white bg-slate-200 aspect-[4/3]">
                  <Image 
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/banking-premium/1200/800"} 
                    alt="City Bank Experience" 
                    fill
                    priority
                    data-ai-hint="modern banking"
                    className="object-cover transition-transform duration-[20s] hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
                </div>
                
                {/* Floating Wealth Card */}
                <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl z-20 border border-white/50 animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-200">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Portfolio APY</p>
                      <p className="text-3xl font-black text-primary leading-none mt-1">5.25%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/20 rounded-full blur-[80px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Global Network Stats */}
        <section className="bg-primary py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Assets Managed", value: "$420B+" },
                { label: "Active Clients", value: "1.2M" },
                { label: "Uptime Protocol", value: "99.99%" },
                { label: "Global Offices", value: "48" },
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-1">
                  <p className="text-accent font-black text-2xl md:text-4xl tracking-tighter">{stat.value}</p>
                  <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section id="services" className="py-32 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-24">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-accent font-black tracking-[0.3em] uppercase text-[10px]">Premium Services</h2>
                <h3 className="text-5xl md:text-6xl font-headline font-black text-primary tracking-tight leading-tight">Banking, Reimagined <br />for the Elite.</h3>
              </div>
              <p className="text-lg text-muted-foreground/70 max-w-sm text-center lg:text-right font-medium leading-relaxed">
                From algorithmic trading to bespoke private trusts, we provide the ultimate toolkit for global capital preservation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Private Banking", desc: "Exquisite personalized service with zero maintenance fees.", icon: Landmark },
                { title: "Wealth Portfolios", desc: "AI-driven insights for aggressive, tax-efficient growth.", icon: CircleDollarSign },
                { title: "Commercial Debt", desc: "Fuel global expansion with low-latency institutional credit.", icon: Briefcase },
                { title: "NexaNetwork", desc: "Instant cross-border transfers with zero settlement fees.", icon: ArrowRightLeft },
              ].map((service, idx) => (
                <div key={idx} className="group p-10 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-accent/10 hover:shadow-2xl transition-all duration-500 space-y-6 cursor-default">
                  <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center group-hover:bg-primary transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:-rotate-6">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-black text-primary tracking-tight leading-none">{service.title}</h4>
                    <p className="text-sm text-muted-foreground/80 font-medium leading-relaxed">{service.desc}</p>
                  </div>
                  <Button variant="link" className="p-0 text-accent font-black uppercase tracking-widest text-[10px] h-auto group-hover:translate-x-2 transition-transform">
                    Explore <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrated Ecosystem Promo */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-4xl border-[12px] border-white/5 rotate-[-1deg]">
                  <Image 
                    src={mobileAppImage?.imageUrl || "https://picsum.photos/seed/banking-mobile/600/800"} 
                    alt="Mobile Banking" 
                    width={600} 
                    height={800}
                    data-ai-hint="mobile banking"
                    className="w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="absolute -top-10 -right-10 h-40 w-48 bg-accent/20 rounded-full blur-[100px]" />
              </div>
              <div className="space-y-10">
                <h3 className="text-5xl md:text-7xl font-headline font-black leading-tight tracking-tighter">Your Assets, <br /><span className="text-accent italic">Everywhere.</span></h3>
                <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  The NexaTerminal provides absolute control over your global liquidity. Manage cross-border payroll, investment hedges, and personal wealth from one award-winning interface.
                </p>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-accent tracking-tighter">Quantum</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Encryption Grade</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-accent tracking-tighter">Instant</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Global Liquidity</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="h-14 px-8 bg-white text-primary rounded-2xl flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-300 cursor-pointer shadow-xl font-black text-xs uppercase tracking-widest">
                    <Smartphone className="mr-3 h-5 w-5" /> App Store
                  </div>
                  <div className="h-14 px-8 bg-white/10 text-white rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer font-black text-xs uppercase tracking-widest">
                    Google Play
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-slate-950 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-accent p-2.5 rounded-xl shadow-xl shadow-accent/20">
                  <Building2 className="text-white h-6 w-6" />
                </div>
                <span className="font-headline font-black text-3xl tracking-tighter text-white uppercase">City Bank</span>
              </div>
              <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
                The premier partner for international wealth. Regulated across 180+ jurisdictions and built for the next century of finance.
              </p>
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all cursor-pointer group">
                  <Globe className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent transition-all cursor-pointer group">
                  <ShieldCheck className="h-5 w-5 text-slate-400 group-hover:text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-accent">Liquidity</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Wealth Portfolios</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Offshore Trusts</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Treasury Yield</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Private Equity</LinkNext></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-accent">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><LinkNext href="#" className="hover:text-white transition-colors">Terms of Sovereignty</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">Privacy Framework</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">Compliance Portal</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">Vault Security</LinkNext></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            <p>© 2024 City International Bank. Member FDIC. Equal Housing Lender.</p>
            <div className="flex gap-10">
              <span className="text-green-500 flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Network: Online</span>
              <span className="hover:text-white cursor-pointer transition-colors">Legal Disclosure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
