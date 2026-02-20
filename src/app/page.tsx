
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
  ArrowRightLeft
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-body">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Building2 className="text-white h-6 w-6" />
            </div>
            <span className="font-headline font-black text-2xl tracking-tighter text-primary">NEXA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-primary">
            <Link href="#" className="hover:text-accent transition-colors">Personal</Link>
            <Link href="#" className="hover:text-accent transition-colors">Business</Link>
            <Link href="#" className="hover:text-accent transition-colors">Wealth</Link>
            <Link href="#" className="hover:text-accent transition-colors">About Us</Link>
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
                  Finance at the speed of <span className="text-accent underline decoration-4 underline-offset-8">Life.</span>
                </h1>
                <p className="text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
                  Join millions of users worldwide who trust Nexa International for their global banking needs. Secure, smart, and exceptionally fast.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-7" asChild>
                    <Link href="/dashboard">Get Started Today <ChevronRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-7">
                    Explore Solutions
                  </Button>
                </div>
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-slate-200 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium opacity-60">
                    Trusted by 5M+ customers
                  </p>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <Image 
                    src="https://picsum.photos/seed/nexa1/1200/800" 
                    alt="App Preview" 
                    width={1200} 
                    height={800}
                    data-ai-hint="digital banking"
                    className="w-full"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 z-20">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Savings Interest</p>
                    <p className="text-2xl font-black text-primary">4.85% APY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl font-headline font-black text-primary">Everything you need from a bank, plus more.</h2>
              <p className="text-lg text-slate-600 leading-relaxed">We've stripped away the complexity to give you a banking experience that actually works for you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Shield className="h-8 w-8 text-accent" />, 
                  title: "Uncompromising Security", 
                  desc: "Military-grade encryption and 24/7 fraud monitoring keep your assets protected." 
                },
                { 
                  icon: <ArrowRightLeft className="h-8 w-8 text-accent" />, 
                  title: "Instant Global Transfers", 
                  desc: "Send money across borders in seconds with real-time exchange rates and zero hidden fees." 
                },
                { 
                  icon: <CreditCard className="h-8 w-8 text-accent" />, 
                  title: "Smart Card Controls", 
                  desc: "Manage your physical and virtual cards instantly. Freeze, unfreeze, or set limits with a tap." 
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-headline font-bold mb-4 text-primary">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-[3rem] overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-12 lg:p-20 flex flex-col justify-center text-white">
                  <h2 className="text-4xl lg:text-5xl font-headline font-black mb-8 leading-tight">Banking that's as mobile as you are.</h2>
                  <div className="space-y-6">
                    {[
                      "Deposit checks by taking a photo",
                      "Pay bills with a simple scan",
                      "Track your spending with automated insights",
                      "Live chat support whenever you need it"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
                        <span className="text-lg font-medium opacity-90">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-12">
                    <div className="bg-black/20 rounded-xl px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-black/30 transition-colors">
                      <Smartphone className="h-8 w-8 text-white" />
                      <div>
                        <p className="text-[10px] uppercase font-bold opacity-60">Download on the</p>
                        <p className="font-bold">App Store</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative min-h-[400px]">
                  <Image 
                    src="https://picsum.photos/seed/nexa4/800/1200" 
                    alt="Mobile App" 
                    fill
                    className="object-cover"
                    data-ai-hint="mobile banking"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-accent p-2 rounded-lg">
                  <Building2 className="text-white h-6 w-6" />
                </div>
                <span className="font-headline font-black text-2xl tracking-tighter">NEXA</span>
              </div>
              <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
                Empowering global citizens with borderless banking solutions. Nexa International is a registered trademark of Nexa Global Bank Ltd.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-accent">Accounts</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Checking</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Savings</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Business</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cards</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-accent">Support</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Fraud Reporting</Link></li>
              </ul>
            </div>
            <div className="col-span-2">
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-accent">Stay Connected</h4>
              <div className="flex gap-4">
                <Button size="icon" variant="outline" className="rounded-full border-slate-700 bg-transparent hover:bg-slate-800">
                  <Globe className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2024 Nexa International. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms of Service</Link>
              <Link href="#" className="hover:text-white">Legal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
