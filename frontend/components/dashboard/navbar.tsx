'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-blue-600">Pflege-App</h1>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">{t('nav.dashboard')}</Button>
              </Link>
              <Link href="/dashboard/patients">
                <Button variant="ghost">{t('nav.patients')}</Button>
              </Link>
              <Link href="/dashboard/todos">
                <Button variant="ghost">{t('nav.todos')}</Button>
              </Link>
              <Link href="/dashboard/statistics">
                <Button variant="ghost">{t('nav.statistics')}</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="outline" onClick={logout}>
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
