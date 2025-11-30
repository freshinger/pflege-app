'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Todo } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function TodaysTodos() {
  const { t } = useTranslation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTodaysTodos();
  }, []);

  const fetchTodaysTodos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Todo[]>('/todos/today');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching today\'s todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (todoId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

  const isOverdue = (dueDate: Date | string) => {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    return due < new Date();
  };

  const getMainDiagnosis = (patient: Todo['patient']) => {
    if (!patient?.diagnoses) return null;
    const mainDiagnosis = patient.diagnoses.find((d) => d.isMain);
    return mainDiagnosis?.text || null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl font-semibold mb-4">{t('dashboard.todaysTodos')}</h3>
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-xl font-semibold mb-4">{t('dashboard.todaysTodos')}</h3>
        <p className="text-muted-foreground">{t('dashboard.noTodosToday')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-xl font-semibold mb-4">{t('dashboard.todaysTodos')}</h3>
      <div className="space-y-2">
        {todos.map((todo) => {
          const overdue = isOverdue(todo.dueDate);
          const expanded = expandedItems.has(todo.id);
          const patient = todo.patient;
          const mainDiagnosis = patient ? getMainDiagnosis(patient) : null;

          return (
            <div
              key={todo.id}
              className={cn(
                'border rounded-lg transition-all',
                overdue
                  ? 'border-red-500 bg-red-50 hover:bg-red-100'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <button
                onClick={() => toggleExpand(todo.id)}
                className="w-full text-left p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {overdue && (
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {patient
                          ? `${patient.lastName}, ${patient.firstName}`
                          : t('common.unknown')}
                      </span>
                      {patient?.roomNumber && (
                        <Badge variant="outline" className="text-xs">
                          {t('patients.roomNumber')}: {patient.roomNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{todo.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(
                        typeof todo.dueDate === 'string'
                          ? new Date(todo.dueDate)
                          : todo.dueDate,
                        'HH:mm',
                        { locale: de }
                      )}
                      {overdue && (
                        <span className="ml-2 text-red-600 font-medium">
                          ({t('todos.overdue')})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-4 shrink-0">
                  {expanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 border-t pt-4 mt-2 space-y-3">
                  {mainDiagnosis && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {t('patients.mainDiagnosis')}
                      </div>
                      <div className="text-sm text-gray-900">{mainDiagnosis}</div>
                    </div>
                  )}

                  {patient?.allergies && patient.allergies.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        {t('patients.allergies')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge
                            key={index}
                            variant="destructive"
                            className="text-xs"
                          >
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {todo.description && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {t('todos.description')}
                      </div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {todo.description}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      {t('todos.category')}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {t(`todos.${todo.category}`)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

