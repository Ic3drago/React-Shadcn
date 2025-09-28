import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'CRUD Usuarios - Next.js 15 + Supabase',
  description: 'Sistema de gestión de usuarios con Next.js 15, Supabase y shadcn/ui',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
      >
        {children} <Toaster />
      </body>
    </html>
  )
}