
"use client";

import { Building2, Zap, BarChart3, Lock, ShieldCheck, PieChart } from "lucide-react";
import LinkNext from "next/link";
import { useTranslation } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  const { t } = useTranslation();

  const services = [
    {
      title: "Wealth Management",
      desc: "Tailored portfolio strategies designed for long-term growth and capital preservation.",
      icon: PieChart
    },
    {
      title: "Institutional Custody",
      desc: "Secure, audited storage solutions for diverse asset classes, from digital to traditional fiat.",
      icon: Lock
    },
    {
      title: "NexaSettlement",
      desc: "Instant global settlements with zero latency, powered by our proprietary financial network.",
      icon: Zap
    },
    {
      title: "Treasury Services",
      desc: "Optimized cash management and liquidity solutions for corporate and institutional treasuries.",
      icon: Building2
    },
    {
      title: "Yield Intelligence",
      desc: "AI-driven market analysis providing real-time yield optimization and risk assessment.",
      icon: BarChart3
    },
    {
      title: "Compliance & Security",
      desc: "Advanced multi-sig authorization and AES-256 encryption protocols for every transaction.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-accent/30">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <LinkNext href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-xl">
              <Building2 className="text-white h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-headline font-black text-xl sm:text-2xl tracking-tighter text-white leading-none">CITY BANK</span>
              <span className="text-[7px] sm:text-[9px] font-black tracking-[0.3em] text-accent uppercase">International</span>
            </div>
          </LinkNext>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button className="bg-accent hover:bg-accent/90" asChild>
              <LinkNext href="/auth?mode=signup">{t('nav_open_account')}</LinkNext>
            </Button>
          </div>
        </div>
      </nav>

      <main className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-20 space-y-6">
            <h1 className="text-5xl sm:text-7xl font-headline font-black tracking-tighter">
              {t('services_title')}
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              {t('services_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-accent/40 transition-all duration-500 group">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-accent transition-colors">
                  <service.icon className="h-7 w-7 text-accent group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4">{service.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 py-16 border-t border-white/5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Institutional Grade Financial Infrastructure</p>
        </div>
      </footer>
    </div>
  );
}
