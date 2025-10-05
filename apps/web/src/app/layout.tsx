import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Controle Financeiro - Para Casais LGBT',
  description: 'Sistema de controle financeiro compartilhado voltado para casais LGBT, com foco em transparência, planejamento inclusivo e saúde financeira do relacionamento.',
  keywords: ['finanças', 'casal', 'LGBT', 'orçamento', 'planejamento', 'transparência'],
  authors: [{ name: 'Controle Financeiro Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
