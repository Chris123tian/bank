import Link from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Shield, 
  Smartphone, 
  Globe, 
  ChevronRight, 
  CheckCircle2,
  TrendingUp,
  CreditCard,
  ArrowRightLeft,
  MapPin,
  Landmark,
  CircleDollarSign,
  Briefcase,
  UserCheck,
  Zap,
  ShieldCheck,
  Headphones
} from "lucide-react";
import LinkNext from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-body text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Building2 className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-headline font-black text-xl tracking-tighter text-primary leading-none">CITY BANK</span>
              <span className="text-[8px] font-black tracking-[0.2em] text-accent uppercase">International</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-primary/80">
            <LinkNext href="#services" className="hover:text-accent transition-colors">Services</LinkNext>
            <LinkNext href="#global" className="hover:text-accent transition-colors">Locations</LinkNext>
            <LinkNext href="/auth" className="hover:text-accent transition-colors">Business</LinkNext>
            <LinkNext href="/auth" className="hover:text-accent transition-colors">Wealth</LinkNext>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex text-primary font-bold" asChild>
              <LinkNext href="/auth">Sign In</LinkNext>
            </Button>
            <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20" asChild>
              <LinkNext href="/auth?mode=signup">Open Account</LinkNext>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 bg-primary text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent skew-x-12 translate-x-20" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase border border-white/20">
                  <Globe className="h-3 w-3 text-accent" />
                  Global Banking Excellence
                </div>
                <h1 className="text-5xl md:text-7xl font-headline font-black leading-tight">
                  Finance at the speed of <span className="text-accent underline decoration-4 underline-offset-8">City.</span>
                </h1>
                <p className="text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
                  Join millions of users worldwide who trust City International Bank for their global financial needs. Experience seamless, secure, and fast banking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-7 shadow-xl shadow-accent/30" asChild>
                    <LinkNext href="/auth?mode=signup">Get Started Now <ChevronRight className="ml-2 h-5 w-5" /></LinkNext>
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-7" asChild>
                    <LinkNext href="#services">View Our Services</LinkNext>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block relative animate-in fade-in zoom-in-95 duration-1000">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-800">
                  <Image 
                    src="https://picsum.photos/seed/citybank1/1200/800" 
                    alt="City Bank App" 
                    width={1200} 
                    height={800}
                    data-ai-hint="digital banking"
                    className="w-full opacity-90"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-slate-100">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">High Yield Savings</p>
                    <p className="text-2xl font-black text-primary">5.25% APY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Row */}
        <section className="py-12 bg-white border-b overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2 font-black text-sm tracking-tighter"><Zap className="h-5 w-5" /> INSTANT-PAY</div>
              <div className="flex items-center gap-2 font-black text-sm tracking-tighter"><ShieldCheck className="h-5 w-5" /> SECURE-VAULT</div>
              <div className="flex items-center gap-2 font-black text-sm tracking-tighter"><Globe className="h-5 w-5" /> GLOBAL-REACH</div>
              <div className="flex items-center gap-2 font-black text-sm tracking-tighter"><Headphones className="h-5 w-5" /> 24/7-SUPPORT</div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-accent font-bold tracking-widest uppercase text-sm">Our Services</h2>
            <h3 className="text-4xl font-headline font-black text-primary">Tailored Solutions for Your Life</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto pb-12">
              From daily checking to high-yield savings and corporate investment, we provide the tools you need to grow your wealth across borders.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Personal Banking", desc: "Everyday checking and savings accounts with no monthly maintenance fees.", icon: Landmark },
                { title: "Wealth Management", desc: "Expert advisory services for long-term growth and tax-efficient strategies.", icon: CircleDollarSign },
                { title: "Business Solutions", desc: "Comprehensive banking tools for companies scaling in global markets.", icon: Briefcase },
                { title: "Global Transfers", desc: "Send money worldwide with real-time tracking and competitive FX rates.", icon: ArrowRightLeft },
              ].map((service, idx) => (
                <div key={idx} className="p-8 rounded-2xl border bg-slate-50 hover:bg-white hover:shadow-2xl hover:border-accent hover:-translate-y-1 transition-all duration-300 text-left space-y-4 group">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors shadow-sm">
                    <service.icon className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-primary">{service.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                  <Button variant="link" className="p-0 text-accent font-bold h-auto group-hover:translate-x-1 transition-transform">
                    Learn more <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Presence */}
        <section id="global" className="py-20 bg-slate-50 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-headline font-black text-primary">Global Presence</h2>
              <p className="text-muted-foreground mt-2">Serving clients from our primary international hubs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-white p-2 rounded-lg"><MapPin className="h-5 w-5" /></div>
                  <h3 className="font-bold text-primary">Head Office (USA)</h3>
                </div>
                <p className="text-sm text-muted-foreground">25 Cedar St, 6th Floor, New York, 10038 United States of America</p>
              </div>
              <div className="flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-white p-2 rounded-lg"><MapPin className="h-5 w-5" /></div>
                  <h3 className="font-bold text-primary">UK Branch</h3>
                </div>
                <p className="text-sm text-muted-foreground">10 Lower Thames St, London EC3R 6AF, United Kingdom</p>
              </div>
              <div className="flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-white p-2 rounded-lg"><MapPin className="h-5 w-5" /></div>
                  <h3 className="font-bold text-primary">Australia Branch</h3>
                </div>
                <p className="text-sm text-muted-foreground">1 Bligh St, Sydney NSW 2000, Australia</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 text-slate-400">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-accent p-2 rounded-lg">
                  <Building2 className="text-white h-6 w-6" />
                </div>
                <span className="font-headline font-black text-2xl tracking-tighter text-white">CITY BANK</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                City International Bank. 25 Cedar St, 6th Floor. New York, 10038 United States of America.
              </p>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-accent transition-colors cursor-pointer">
                  <Globe className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-accent">Accounts</h4>
              <ul className="space-y-4 text-sm">
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Checking</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Savings</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Wealth Management</LinkNext></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-accent">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Help Center</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">Legal & Privacy</LinkNext></li>
                <li><LinkNext href="/auth" className="hover:text-white transition-colors">ATM Locator</LinkNext></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2024 City International Bank. All rights reserved. Member FDIC.</p>
            <div className="flex gap-6">
              <LinkNext href="#" className="hover:text-white">Privacy Policy</LinkNext>
              <LinkNext href="#" className="hover:text-white">Terms of Service</LinkNext>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}