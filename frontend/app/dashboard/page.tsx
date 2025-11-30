'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TodaysTodos } from '@/components/dashboard/todays-todos';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Willkommen, {user?.firstName}!
        </h2>
        <p className="mt-2 text-gray-600">
          Verwalten Sie Patienten und Aufgaben für die tägliche Pflege
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TodaysTodos />
        </div>
        <div className="flex flex-col gap-6">
          <Link href="/dashboard/patients">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Patienten
              </h3>
              <p className="text-gray-600">
                Patientendaten verwalten und einsehen
              </p>
            </div>
          </Link>

          <Link href="/dashboard/todos">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aufgaben
              </h3>
              <p className="text-gray-600">
                Tägliche Aufgaben und Termine planen
              </p>
            </div>
          </Link>

          <Link href="/dashboard/statistics">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Statistiken
              </h3>
              <p className="text-gray-600">
                Besuchshäufigkeit und Analysen
              </p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
