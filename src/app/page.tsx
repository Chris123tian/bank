import Link from "next/link";
import Image from "next/image";
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
  MapPin
} from "lucide-react";

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
            <span className="font-headline font-black text-xl tracking-tighter text-primary">CITY BANK</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-primary">
            <Link href="#" className="hover:text-accent transition-colors">Personal</Link>
            <Link href="#" className="hover:text-accent transition-colors">Business</Link>
            <Link href="#" className="hover:text-accent transition-colors">Wealth</Link>
            <Link href="#" className="hover:text-accent transition-colors">Branches</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90" asChild>
              <Link href="/dashboard">Open Account</Link>
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
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase border border-white/20">
                  <Globe className="h-3 w-3 text-accent" />
                  Banking Reimagined
                </div>
                <h1 className="text-5xl md:text-7xl font-headline font-black leading-tight">
                  Finance at the speed of <span className="text-accent underline decoration-4 underline-offset-8">City.</span>
                </h1>
                <p className="text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
                  Join millions of users worldwide who trust City International Bank for their global banking needs. Headquartered in New York with branches in London and Sydney.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-7" asChild>
                    <Link href="/dashboard">Access Dashboard <ChevronRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-7">
                    Explore Solutions
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
                  <Image 
                    src="https://picsum.photos/seed/citybank1/1200/800" 
                    alt="City Bank App" 
                    width={1200} 
                    height={800}
                    data-ai-hint="digital banking"
                    className="w-full opacity-90"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 z-20">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-black">Savings Interest</p>
                    <p className="text-2xl font-black text-primary">5.25% APY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Presence */}
        <section className="py-20 bg-slate-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border">
                <MapPin className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="font-bold text-primary">Head Office (USA)</h3>
                  <p className="text-sm text-muted-foreground mt-1">25 Cedar St, 6th Floor, New York, 10038 United States</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border">
                <MapPin className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="font-bold text-primary">UK Branch</h3>
                  <p className="text-sm text-muted-foreground mt-1">10 Lower Thames St, London EC3R 6AF, United Kingdom</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border">
                <MapPin className="h-6 w-6 text-accent mt-1" />
                <div>
                  <h3 className="font-bold text-primary">Australia Branch</h3>
                  <p className="text-sm text-muted-foreground mt-1">1 Bligh St, Sydney NSW 2000, Australia</p>
                </div>
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
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-accent">Accounts</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Checking</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Savings</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Wealth</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-accent">Support</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Legal</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2024 City International Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
