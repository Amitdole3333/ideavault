import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IdeaVault — Blockchain-Powered Startup Idea Registry',
  description: 'Register your startup idea on Algorand blockchain. Get immutable proof of ownership. Connect with verified investors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">IV</div>
              <span className="font-bold text-white text-lg">IdeaVault</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/browse" className="text-slate-400 hover:text-white text-sm transition-colors">Browse Ideas</Link>
              <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
              <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-slate-800 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
            <p>IdeaVault — Powered by <span className="text-blue-400 font-semibold">Algorand Blockchain</span> | Built with AlgoKit</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
