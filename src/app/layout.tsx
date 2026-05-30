import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Next Level Store | Premium Digital Game Showcase & Reseller',
  description: 'Premium digital PC games, Steam keys, gift cards, offline access, and online premium multiplayer accounts at the absolute best reseller prices.',
  keywords: ['digital games', 'game reseller', 'steam keys', 'cheap pc games', 'premium accounts', 'gift cards', 'offline games', 'gaming store'],
  openGraph: {
    title: 'Next Level Store | Premium Digital Game Showcase',
    description: 'Get your favorite games instantly at reseller prices. Steam, Online, Offline, Multiplayer, Gift Cards and more!',
    url: 'https://nextlevelstore.com',
    siteName: 'Next Level Store',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next Level Store | Premium Digital Game Reseller',
    description: 'The finest digital PC games, keys, and gaming accessories at the lowest prices.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        {/* Ambient background glows */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#7c3aed]/[0.06] rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />
        <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-[#d946ef]/[0.04] rounded-full blur-[100px] pointer-events-none -z-10" />

        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
