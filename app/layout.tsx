import './globals.css';

export const metadata = {
  title: 'ApexState | Performance OS',
  description: 'Frictionless gym logging, smart AI splits, and gamified fitness leagues.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
