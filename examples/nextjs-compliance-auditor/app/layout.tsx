import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Privacy Compliance Auditor',
  description: 'Privacy-preserving compliance auditing powered by Zama FHE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
