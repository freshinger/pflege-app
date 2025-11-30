'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale/de';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast } from 'react-toastify';
import { Todo, Patient, TodoPriority } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { PatientSelector } from '@/components/todos/patient-selector';
import { TodoDialog } from '@/components/todos/todo-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Configure date-fns for German locale
const locales = {
  de: de,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: de }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Todo;
}

export default function TodosPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchPatientById = useCallback(async (patientId: string) => {
    try {
      const response = await apiClient.get<Patient>(`/patients/${patientId}`);
      setSelectedPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error(t('common.error'));
    }
  }, [t]);

  // Load patient from URL query parameter
  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (patientId) {
      // Only fetch if the patientId from URL is different from currently selected patient
      if (!selectedPatient || selectedPatient.id !== patientId) {
        fetchPatientById(patientId);
      }
    }
  }, [searchParams, selectedPatient, fetchPatientById]);

  useEffect(() => {
    if (selectedPatient) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [selectedPatient]);

  const fetchTodos = async () => {
    if (!selectedPatient) return;

    setLoading(true);
    try {
      const response = await apiClient.get<Todo[]>('/todos', {
        params: { patientId: selectedPatient.id },
      });
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (!selectedPatient) {
      toast.error(t('todos.selectPatientFirst'));
      return;
    }
    setSelectedDate(start);
    setSelectedTodo(null);
    setTodoDialogOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTodo(event.resource);
    setSelectedDate(null);
    setTodoDialogOpen(true);
  };

  const handleTodoSubmit = async (data: any) => {
    try {
      if (selectedTodo) {
        // Update existing todo
        await apiClient.put(`/todos/${selectedTodo.id}`, data);
        toast.success(t('common.success'));
      } else {
        // Create new todo
        await apiClient.post('/todos', data);
        toast.success(t('common.success'));
      }
      fetchTodos();
      setTodoDialogOpen(false);
      setSelectedTodo(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error saving todo:', error);
      toast.error(t('common.error'));
    }
  };

  // Convert todos to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return todos.map((todo) => {
      const dueDate = new Date(todo.dueDate);
      // Set end time to 1 hour after start for display purposes
      const endDate = new Date(dueDate);
      endDate.setHours(endDate.getHours() + 1);

      return {
        id: todo.id,
        title: todo.title,
        start: dueDate,
        end: endDate,
        resource: todo,
      };
    });
  }, [todos]);

  // Event style getter based on priority
  const eventStyleGetter = (event: CalendarEvent) => {
    const priority = event.resource.priority;
    let backgroundColor = '#3174ad'; // default blue

    switch (priority) {
      case TodoPriority.URGENT:
        backgroundColor = '#dc2626'; // red
        break;
      case TodoPriority.HIGH:
        backgroundColor = '#ea580c'; // orange
        break;
      case TodoPriority.MEDIUM:
        backgroundColor = '#eab308'; // yellow
        break;
      case TodoPriority.LOW:
        backgroundColor = '#22c55e'; // green
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.resource.completed ? 0.5 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('todos.title')}</h1>
      </div>

      <div className="space-y-4">
        <div className="max-w-md">
          <label className="text-sm font-medium mb-2 block">
            {t('todos.selectPatient')}
          </label>
          <PatientSelector
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
          />
        </div>

        {!selectedPatient ? (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">{t('todos.noPatientSelected')}</p>
          </div>
        ) : loading ? (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-4">
            <div className="mb-4 flex gap-2">
              <Button
                variant={currentView === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('month')}
              >
                {t('calendar.month')}
              </Button>
              <Button
                variant={currentView === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('week')}
              >
                {t('calendar.week')}
              </Button>
              <Button
                variant={currentView === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('day')}
              >
                {t('calendar.day')}
              </Button>
            </div>
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                eventPropGetter={eventStyleGetter}
                messages={{
                  next: t('calendar.next') || 'Weiter',
                  previous: t('calendar.previous') || 'Zurück',
                  today: t('calendar.today'),
                  month: t('calendar.month'),
                  week: t('calendar.week'),
                  day: t('calendar.day'),
                }}
              />
            </div>
          </div>
        )}
      </div>

      <TodoDialog
        open={todoDialogOpen}
        onOpenChange={setTodoDialogOpen}
        todo={selectedTodo}
        patient={selectedPatient}
        defaultDate={selectedDate || undefined}
        onSubmit={handleTodoSubmit}
      />
    </div>
  );
}
