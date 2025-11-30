'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Todo, TodoCategory, TodoPriority, Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

const todoSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  category: z.nativeEnum(TodoCategory),
  priority: z.nativeEnum(TodoPriority),
  dueDate: z.string().refine((date) => {
    const d = new Date(date);
    return d.toString() !== 'Invalid Date';
  }, 'Ungültiges Datum'),
  patientId: z.string().min(1, 'Patient ist erforderlich'),
});

type TodoFormValues = z.infer<typeof todoSchema>;

interface TodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo | null;
  patient: Patient | null;
  defaultDate?: Date;
  onSubmit: (data: TodoFormValues) => Promise<void>;
}

export function TodoDialog({
  open,
  onOpenChange,
  todo,
  patient,
  defaultDate,
  onSubmit,
}: TodoDialogProps) {
  const { t } = useTranslation();

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      category: TodoCategory.BEATMUNG,
      priority: TodoPriority.MEDIUM,
      dueDate: '',
      patientId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (todo) {
        // Edit mode
        const dueDate = new Date(todo.dueDate);
        form.reset({
          title: todo.title,
          description: todo.description || '',
          category: todo.category,
          priority: todo.priority,
          dueDate: dueDate.toISOString().slice(0, 16), // Format for datetime-local input
          patientId: todo.patientId,
        });
      } else {
        // Create mode
        const dateToUse = defaultDate || new Date();
        const formattedDate = new Date(dateToUse).toISOString().slice(0, 16);
        form.reset({
          title: '',
          description: '',
          category: TodoCategory.BEATMUNG,
          priority: TodoPriority.MEDIUM,
          dueDate: formattedDate,
          patientId: patient?.id || '',
        });
      }
    }
  }, [open, todo, patient, defaultDate, form]);

  const handleSubmit = async (data: TodoFormValues) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {todo ? t('todos.editTodo') : t('todos.addTodo')}
          </DialogTitle>
          <DialogDescription>
            {todo
              ? 'Bearbeiten Sie die Aufgabe hier.'
              : 'Erstellen Sie eine neue Aufgabe für den Patienten.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('todos.todoTitle')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('todos.todoTitle')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('todos.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('todos.description')}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('todos.category')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TodoCategory.BEATMUNG}>
                          {t('todos.Beatmung')}
                        </SelectItem>
                        <SelectItem value={TodoCategory.ERNAEHRUNG}>
                          {t('todos.Ernährung')}
                        </SelectItem>
                        <SelectItem value={TodoCategory.BEWEGUNG}>
                          {t('todos.Bewegung')}
                        </SelectItem>
                        <SelectItem value={TodoCategory.AUSSCHEIDUNG}>
                          {t('todos.Ausscheidung')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('todos.priority')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TodoPriority.LOW}>
                          {t('todos.low')}
                        </SelectItem>
                        <SelectItem value={TodoPriority.MEDIUM}>
                          {t('todos.medium')}
                        </SelectItem>
                        <SelectItem value={TodoPriority.HIGH}>
                          {t('todos.high')}
                        </SelectItem>
                        <SelectItem value={TodoPriority.URGENT}>
                          {t('todos.urgent')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('todos.dueDate')}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

