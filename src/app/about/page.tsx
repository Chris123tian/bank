
"use client";

import { Building2, Globe, ShieldCheck, MapPin } from "lucide-react";
import Image from "next/image";
import LinkNext from "next/link";
import { useTranslation } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-accent/30">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <LinkNext href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-xl">
              <Building2 className="text-white h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-headline font-black text-xl sm:text-2xl tracking-tighter text-white leading-none uppercase">City Global</span>
              <span className="text-[7px] sm:text-[9px] font-black tracking-[0.3em] text-accent uppercase">Bank</span>
            </div>
          </LinkNext>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="outline" className="text-white border-white/20" asChild>
              <LinkNext href="/auth">{t('nav_login')}</LinkNext>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 sm:py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-5xl sm:text-7xl font-headline font-black tracking-tighter">
                {t('about_title')}
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                {t('about_desc')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white text-slate-950 rounded-[3rem] mx-4 lg:mx-8 mb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tight text-primary">Global Presence</h2>
              <p className="text-lg text-slate-600">
                City Global Bank operates at the intersection of global trade and institutional finance. With strategic hubs in the world's most vital financial markets, we ensure our clients have 24/7 access to liquidity.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Head Office (USA)</h4>
                    <p className="text-slate-500">25 Cedar St, 6th Floor, New York, 10038 United States of America</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">European Hub (UK)</h4>
                    <p className="text-slate-500">Canary Wharf, London, United Kingdom</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Asia-Pacific Hub (Australia)</h4>
                    <p className="text-slate-500">Barangaroo, Sydney, Australia</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-center">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="space-y-6 p-0">
                  <ShieldCheck className="h-12 w-12 text-accent" />
                  <h3 className="text-2xl font-black text-primary">Institutional Integrity</h3>
                  <p className="text-slate-600">
                    Our governance framework is designed to meet the highest regulatory standards across all jurisdictions. We prioritize the security of assets above all else, leveraging multi-sig protocols and audited custody solutions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-16 border-t border-white/5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{t('footer_address')}</p>
          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">© 2024 City Global Bank. Member FDIC. Equal Housing Lender.</p>
        </div>
      </footer>
    </div>
  );
}
