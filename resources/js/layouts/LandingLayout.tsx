import { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import Header from '@/components/Landing/Header';
import Footer from '@/components/Landing/Footer';

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  const { setting } = usePage<SharedData>().props;
  const primaryColor = setting?.warna || '#2563eb';

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header primaryColor={primaryColor} />
      <main className="flex-1">
        {children}
      </main>
      <Footer primaryColor={primaryColor} />
    </div>
  );
}
