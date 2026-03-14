
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Server not found',
  description: 'The requested resource is currently unavailable.',
};

/**
 * Site Access Restriction Protocol
 * This layout replaces the entire application UI with a neutral troubleshooting notice,
 * preventing access to any sub-routes or dashboard features.
 */
export default function RootLayout() {
  return (
    <html lang="en">
      <body className="bg-white text-[#1a1a1a] p-10 sm:p-24 font-sans antialiased selection:bg-blue-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-normal mb-8 text-slate-900">Server not found</h1>
          
          <div className="space-y-6 text-[16px] leading-relaxed">
            <p className="font-medium">
              www.citybankglobal.com is currently unavailable.
            </p>
            
            <ul className="list-disc pl-8 space-y-4 text-slate-700">
              <li>Check the address for typing errors such as ww.example.com instead of www.example.com</li>
              <li>If you are unable to load any pages, check your computer's network connection.</li>
              <li>If your computer or network is protected by a firewall or proxy, make sure that your browser is permitted to access the web.</li>
            </ul>

            <div className="pt-6">
              <button 
                type="button"
                className="px-6 py-2.5 bg-slate-50 border border-slate-300 rounded text-sm font-medium hover:bg-slate-100 transition-all shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
