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
  MapPin,
  Zap,
  ShieldCheck,
  Headphones,
  LayoutDashboard,
  Shield
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
    <div className="min-h-screen flex flex-col font-body bg-white text-foreground">
      {/* Premium Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-xl transition-transform group-hover:scale-110">
              <Building2 className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-headline font-black text-xl tracking-tighter text-primary leading-none">CITY BANK</span>
              <span className="text-[8px] font-black tracking-[0.2em] text-accent uppercase">International</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-primary/70">
            <LinkNext href="#services" className="hover:text-accent transition-colors">Services</LinkNext>
            <LinkNext href="#global" className="hover:text-accent transition-colors">Locations</LinkNext>
            <LinkNext href="/auth" className="hover:text-accent transition-colors">Business</LinkNext>
            <LinkNext href="/auth" className="hover:text-accent transition-colors">Wealth</LinkNext>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button className="bg-primary hover:bg-primary/90 shadow-xl rounded-full px-6" asChild>
                <LinkNext href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  My Dashboard
                </LinkNext>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex text-primary font-black uppercase tracking-widest text-[10px]" asChild>
                  <LinkNext href="/auth">Sign In</LinkNext>
                </Button>
                <Button className="bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 rounded-full px-8 py-6 font-bold" asChild>
                  <LinkNext href="/auth?mode=signup">Open Account</LinkNext>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Dynamic Hero Section */}
        <section className="relative py-20 lg:py-32 bg-slate-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-[10px] font-black tracking-widest uppercase border border-accent/20">
                  <Shield className="h-3 w-3" />
                  Institutional Grade Security
                </div>
                <h1 className="text-6xl md:text-8xl font-headline font-black leading-[0.9] tracking-tighter text-primary">
                  Future of Finance. <br />
                  <span className="text-accent italic">Now.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Experience seamless global banking with City International. High-yield accounts, instant transfers, and wealth management tailored for the modern world.
                </p>
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-10 py-8 rounded-2xl shadow-2xl transition-all hover:-translate-y-1" asChild>
                    <LinkNext href={user ? "/dashboard" : "/auth?mode=signup"}>
                      Get Started <ChevronRight className="ml-2 h-5 w-5" />
                    </LinkNext>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 text-lg px-10 py-8 rounded-2xl bg-white hover:bg-slate-50 transition-all hover:-translate-y-1" asChild>
                    <LinkNext href="#services">Learn More</LinkNext>
                  </Button>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-50 grayscale">
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter"><Zap className="h-4 w-4" /> Instant-Pay</div>
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter"><ShieldCheck className="h-4 w-4" /> Encrypted</div>
                  <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter"><Globe className="h-4 w-4" /> Global</div>
                </div>
              </div>

              <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
                <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[8px] border-white bg-slate-200">
                  <Image 
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/citybank1/1200/800"} 
                    alt="City Bank Experience" 
                    width={1200} 
                    height={800}
                    data-ai-hint="digital banking"
                    className="w-full object-cover aspect-[4/3]"
                  />
                </div>
                {/* Floating Stats Card */}
                <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[2rem] shadow-2xl z-20 border border-slate-100 animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 p-3 rounded-2xl text-white shadow-lg shadow-green-200">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Savings Growth</p>
                      <p className="text-3xl font-black text-primary leading-none mt-1">5.25% <span className="text-sm font-bold opacity-50">APY</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section id="services" className="py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-accent font-black tracking-[0.2em] uppercase text-xs">Our Ecosystem</h2>
                <h3 className="text-5xl font-headline font-black text-primary tracking-tighter">Everything you need <br />to master your money.</h3>
              </div>
              <p className="text-muted-foreground max-w-md text-center lg:text-right font-medium leading-relaxed">
                From basic checking to complex global investment strategies, we provide institutional-grade tools for everyone.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Personal Banking", desc: "No monthly fees. No minimum balance. Total freedom.", icon: Landmark },
                { title: "Wealth Management", desc: "AI-driven insights and human expertise for your portfolio.", icon: CircleDollarSign },
                { title: "Business Solutions", desc: "Scale globally with multi-currency accounts and payroll.", icon: Briefcase },
                { title: "Global Transfers", desc: "Move money instantly across borders with zero hidden fees.", icon: ArrowRightLeft },
              ].map((service, idx) => (
                <div key={idx} className="group p-10 rounded-[2rem] border-2 border-slate-50 bg-slate-50 hover:bg-white hover:border-accent/20 hover:shadow-2xl transition-all duration-500 space-y-6">
                  <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center group-hover:bg-primary transition-colors shadow-sm group-hover:shadow-xl group-hover:shadow-primary/20">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-primary tracking-tight">{service.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{service.desc}</p>
                  </div>
                  <Button variant="link" className="p-0 text-accent font-black uppercase tracking-widest text-[10px] h-auto group-hover:translate-x-2 transition-transform">
                    Explore Service <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* App Promo Section */}
        <section className="py-24 bg-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                  <Image 
                    src={mobileAppImage?.imageUrl || "https://picsum.photos/seed/citybank2/1200/1600"} 
                    alt="Mobile Banking" 
                    width={600} 
                    height={800}
                    data-ai-hint="mobile banking"
                    className="w-full object-cover"
                  />
                </div>
                <div className="absolute -top-10 -right-10 h-40 w-40 bg-accent/20 rounded-full blur-3xl animate-pulse" />
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <h3 className="text-5xl font-headline font-black leading-tight tracking-tighter">Your bank, <br />in your pocket.</h3>
                <p className="text-xl text-primary-foreground/70 font-medium leading-relaxed">
                  Managing your wealth shouldn't be a full-time job. Our award-winning mobile app puts you in total control, anywhere in the world.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-accent">99.9%</p>
                    <p className="text-xs uppercase font-black tracking-widest opacity-60">Uptime Reliability</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black text-accent">256-bit</p>
                    <p className="text-xs uppercase font-black tracking-widest opacity-60">AES Encryption</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-14 w-44 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="font-black text-xs uppercase tracking-widest">App Store</span>
                  </div>
                  <div className="h-14 w-44 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
                    <span className="font-black text-xs uppercase tracking-widest">Play Store</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-950 text-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-accent p-2 rounded-xl">
                  <Building2 className="text-white h-8 w-8" />
                </div>
                <span className="font-headline font-black text-3xl tracking-tighter text-white">CITY BANK</span>
              </div>
              <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                Empowering global citizens with institutional-grade financial tools. Regulated, secure, and built for the next generation of wealth.
              </p>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent transition-all cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent transition-all cursor-pointer">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-accent">Accounts</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Premier Checking</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">High-Yield Savings</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Wealth Management</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Private Banking</LinkNext></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-accent">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><LinkNext href="#" className="hover:text-white transition-colors">Help Center</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">Legal & Compliance</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">Privacy Policy</LinkNext></li>
                <li><LinkNext href="#" className="hover:text-white transition-colors">API Documentation</LinkNext></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-32 pt-8 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <p>© 2024 City International Bank. Member FDIC. Equal Housing Lender.</p>
            <div className="flex gap-8">
              <span className="text-green-500">System Status: Optimal</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
