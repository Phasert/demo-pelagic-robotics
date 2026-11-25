import type { Metadata } from 'next';
import { Footer, Header } from '@/components/chrome';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Pelagic Robotics | Built for the Deep.', template: '%s | Pelagic Robotics' },
  description: 'Follow the PR-01 Manta from the surface to a Caribbean reef in this interactive marine robotics portfolio demo.',
  applicationName: 'Pelagic Robotics',
  icons: { icon: '/mark.svg' },
  openGraph: { type: 'website', siteName: 'Pelagic Robotics', title: 'Pelagic Robotics | Built for the Deep.', description: 'An interactive underwater expedition with the PR-01 Manta.' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-TT">
      <body>
        <Header />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
