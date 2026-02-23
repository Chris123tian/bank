
"use client";

import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Globe, 
  Zap,
  ShieldCheck,
  LayoutDashboard,
  Lock,
  ArrowRight,
  BarChart3,
  MousePointerClick,
  Smartphone,
  ChevronRight
} from "lucide-react";
import LinkNext from "next/link";
import Image from "next/image";
import { useUser } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useTranslation } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LandingPage() {
  const { user } = useUser();
  const { t } = useTranslation();
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-banking");
  const secureVaultImage = PlaceHolderImages.find(img => img.id === "secure-vault");

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-950 text-slate-50 selection:bg-accent/30 overflow-x-hidden">
      {/* Premium Navigation */}
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary p-2 rounded-xl transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]">
              <Building2 className="text-white h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-headline font-black text-xl sm:text-2xl tracking-tighter text-white leading-none uppercase">City Bank</span>
              <span className="text-[7px] sm:text-[9px] font-black tracking-[0.3em] text-accent uppercase">Global</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] uppercase tracking-widest font-black text-slate-400">
            <LinkNext href="/about" className="hover:text-white transition-colors">{t('nav_about')}</LinkNext>
            <LinkNext href="/services" className="hover:text-white transition-colors">{t('nav_services')}</LinkNext>
            <LinkNext href="#security" className="hover:text-white transition-colors">{t('nav_security')}</LinkNext>
            <LinkNext href="/auth" className="hover:text-white transition-colors">{t('nav_institutional')}</LinkNext>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            {user ? (
              <Button className="bg-white text-primary hover:bg-slate-200 rounded-full px-4 sm:px-6 h-9 sm:h-10 text-[10px] sm:text-xs font-bold" asChild>
                <LinkNext href="/dashboard">
                  <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Dashboard
                </LinkNext>
              </Button>
            ) : (
              <Button variant="ghost" className="text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 border border-white/10 rounded-full px-6" asChild>
                <LinkNext href="/auth">{t('nav_login')}</LinkNext>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Cinematic Hero - Performance Optimized */}
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center pt-16 pb-24 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <Image 
                src={heroImage?.imageUrl || "https://images.unsplash.com/photo-1697335713414-42693f1a455f?q=80&w=2000"} 
                alt="Institutional Banking"
                fill
                priority={true}
                loading="eager"
                className="object-cover opacity-30 sm:opacity-40 transition-opacity duration-1000"
                data-ai-hint="modern banking"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="max-w-2xl space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[8px] sm:text-[10px] font-black tracking-widest uppercase">
                  <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t('hero_badge')}
                </div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-headline font-black leading-[0.95] tracking-tighter">
                  {t('hero_title_1')} <br className="hidden sm:block" />
                  <span className="text-accent italic">{t('hero_title_accent')}</span> <br className="hidden sm:block" />
                  {t('hero_title_2')}
                </h1>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-medium max-w-xl">
                {t('hero_desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-6 sm:px-10 h-14 sm:h-16 rounded-xl sm:rounded-2xl group shadow-2xl shadow-primary/40 w-full sm:w-auto" asChild>
                  <LinkNext href="/auth">
                    Access Portal <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </LinkNext>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-xs sm:text-sm px-6 sm:px-10 h-14 sm:h-16 rounded-xl sm:rounded-2xl w-full sm:w-auto" asChild>
                  <LinkNext href="/services">{t('hero_cta_secondary')}</LinkNext>
                </Button>
              </div>

              <div className="pt-6 sm:pt-10 flex items-center gap-6 sm:gap-8 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-black text-white">5.25%</p>
                  <p className="text-[8px] sm:text-[9px] uppercase font-black tracking-[0.2em] text-slate-500">Savings APY</p>
                </div>
                <div className="h-8 sm:h-10 w-px bg-white/10" />
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-black text-white">180+</p>
                  <p className="text-[8px] sm:text-[9px] uppercase font-black tracking-[0.2em] text-slate-500">Global Markets</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Access Grid */}
        <section id="services" className="py-20 sm:py-32 relative bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-20 gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                <h2 className="text-accent font-black tracking-[0.4em] uppercase text-[9px] sm:text-[10px]">The Infrastructure</h2>
                <h3 className="text-3xl sm:text-5xl md:text-6xl font-headline font-black tracking-tighter">Unified Banking Protocol.</h3>
              </div>
              <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed text-center md:text-left">
                Our global settlement network provides instant liquidity and institutional-grade custody for every asset class.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { title: t('feature_custody'), desc: t('feature_custody_desc'), icon: Lock },
                { title: t('feature_settlement'), desc: t('feature_settlement_desc'), icon: Zap },
                { title: t('feature_intelligence'), desc: t('feature_intelligence_desc'), icon: BarChart3 },
                { title: "Global Treasury", desc: "Access 180+ markets from a single verified account.", icon: Globe },
                { title: "Concierge Support", desc: "Priority 24/7 access to specialized banking agents.", icon: Smartphone },
                { title: "One-Click Liquidity", desc: "Instant credit lines backed by your diverse assets.", icon: MousePointerClick },
              ].map((item, i) => (
                <div key={i} className="group p-8 sm:p-10 rounded-3xl sm:rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-accent/40 transition-all duration-500 hover:bg-white/[0.07] flex flex-col justify-between min-h-[280px] sm:h-[320px]">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent transition-colors duration-500">
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent group-hover:text-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg sm:text-xl font-black">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-accent text-[10px] sm:text-xs font-bold w-fit group-hover:translate-x-1 transition-transform mt-4 sm:mt-0">
                    Learn More <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-16 sm:py-24 bg-white text-slate-950 rounded-3xl sm:rounded-[4rem] mx-4 lg:mx-8 mb-16 sm:mb-20 overflow-hidden relative shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
             <div className="space-y-6 sm:space-y-10 text-center lg:text-left">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-4xl sm:text-6xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter text-primary">
                    {t('security_title')}
                  </h3>
                  <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    {t('security_desc')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 sm:gap-12 pt-6 border-t border-slate-100">
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-2xl sm:text-4xl font-black text-primary">$420B+</p>
                    <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400">Assets Under Custody</p>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-2xl sm:text-4xl font-black text-primary">0.0ms</p>
                    <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400">Settlement Latency</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 sm:px-10 h-12 sm:h-14 font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 w-full sm:w-auto">
                    Security Whitepaper
                  </Button>
                  <Button variant="outline" className="border-slate-200 rounded-full px-8 sm:px-10 h-12 sm:h-14 font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-slate-50 w-full sm:w-auto">
                    Compliance API
                  </Button>
                </div>
             </div>
             
             <div className="relative group hidden sm:block">
               <div className="absolute inset-0 bg-primary/10 rounded-[2rem] sm:rounded-[3rem] blur-3xl group-hover:bg-primary/20 transition-colors" />
               <div className="relative aspect-[4/3] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-slate-50">
                 <Image 
                  src={secureVaultImage?.imageUrl || "https://images.unsplash.com/photo-1570044389283-6713c3b1c48b?q=80&w=1200"} 
                  alt="Security Vault" 
                  fill
                  className="object-cover transition-transform duration-[10s] group-hover:scale-110"
                  data-ai-hint="bank security"
                 />
                 <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
               </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-16 sm:py-24 border-t border-white/5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12 mb-16 sm:mb-20">
             <div className="col-span-1 md:col-span-2 space-y-4 sm:space-y-6 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="bg-primary p-2 rounded-lg">
                    <Building2 className="text-white h-5 w-5" />
                  </div>
                  <span className="font-headline font-black text-xl sm:text-2xl tracking-tighter">CITY BANK GLOBAL</span>
                </div>
                <p className="text-slate-400 max-w-sm mx-auto md:mx-0 text-xs sm:text-sm font-medium leading-relaxed">
                  Redefining the standard for international capital management through advanced settlement infrastructure and institutional custody.
                </p>
                <div className="pt-4 space-y-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <p>{t('footer_address')}</p>
                  <p>{t('footer_branches')}</p>
                </div>
             </div>
             <div className="space-y-4 text-center md:text-left">
                <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Company</h5>
                <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-300">
                  <li className="hover:text-accent cursor-pointer transition-colors"><LinkNext href="/about">{t('nav_about')}</LinkNext></li>
                  <li className="hover:text-accent cursor-pointer transition-colors"><LinkNext href="/services">{t('nav_services')}</LinkNext></li>
                  <li className="hover:text-accent cursor-pointer transition-colors">Global Careers</li>
                </ul>
             </div>
             <div className="space-y-4 text-center md:text-left">
                <h5 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Legal</h5>
                <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm font-bold text-slate-300">
                  <li className="hover:text-accent cursor-pointer transition-colors">Privacy Policy</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">Compliance Standards</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">Member FDIC</li>
                </ul>
             </div>
          </div>

          <div className="pt-8 sm:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-center md:text-left">
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{t('footer_standard')}</p>
            <p className="text-[8px] sm:text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">
              © 2024 City Bank Global. All Rights Reserved. Member FDIC. Equal Housing Lender.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
