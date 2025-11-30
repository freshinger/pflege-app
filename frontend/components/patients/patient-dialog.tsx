'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Patient, Gender } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const patientSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  dateOfBirth: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
    message: 'Ungültiges Datum',
  }),
  weight: z.coerce.number().min(0.1, 'Gewicht muss größer als 0 sein'),
  gender: z.enum(['male', 'female', 'other']),
  roomNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSubmit: (data: any) => Promise<void>;
}

interface DiagnosisItem {
  id: string;
  text: string;
  isMain: boolean;
}

interface AllergyItem {
  id: string;
  text: string;
}

export function PatientDialog({
  open,
  onOpenChange,
  patient,
  onSubmit,
}: PatientDialogProps) {
  const { t } = useTranslation();
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [allergies, setAllergies] = useState<AllergyItem[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      weight: 0,
      gender: 'male',
      roomNumber: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (patient) {
      form.reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: new Date(patient.dateOfBirth).toISOString().split('T')[0],
        weight: patient.weight,
        gender: patient.gender,
        roomNumber: patient.roomNumber || '',
        notes: patient.notes || '',
      });
      // Convert diagnoses to state format with unique IDs
      if (patient.diagnoses && patient.diagnoses.length > 0) {
        setDiagnoses(
          patient.diagnoses.map((d, index) => ({
            id: `diagnosis-${index}-${Date.now()}`,
            text: d.text,
            isMain: d.isMain,
          }))
        );
      } else {
        setDiagnoses([]);
      }
      // Convert allergies to state format with unique IDs
      if (patient.allergies && patient.allergies.length > 0) {
        setAllergies(
          patient.allergies.map((a, index) => ({
            id: `allergy-${index}-${Date.now()}`,
            text: a,
          }))
        );
      } else {
        setAllergies([]);
      }
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        weight: 0,
        gender: 'male',
        roomNumber: '',
        notes: '',
      });
      setDiagnoses([]);
      setAllergies([]);
    }
    setNewDiagnosis('');
    setNewAllergy('');
  }, [patient, form, open]);

  const handleSubmit = async (data: PatientFormValues) => {
    // Validate that at least one diagnosis exists
    if (diagnoses.length === 0) {
      toast.error(t('patients.atLeastOneDiagnosis'));
      return;
    }

    // Validate that exactly one diagnosis is marked as main
    const mainDiagnoses = diagnoses.filter((d) => d.isMain);
    if (mainDiagnoses.length !== 1) {
      toast.error(t('patients.exactlyOneMainDiagnosis'));
      return;
    }

    // Validate that all diagnoses have non-empty text
    if (diagnoses.some((d) => !d.text || d.text.trim() === '')) {
      toast.error(t('patients.diagnosisTextRequired'));
      return;
    }

    await onSubmit({
      ...data,
      diagnoses: diagnoses.map((d) => ({ text: d.text.trim(), isMain: d.isMain })),
      allergies: allergies.map((a) => a.text.trim()).filter((a) => a !== ''),
    });
    onOpenChange(false);
  };

  const addDiagnosis = () => {
    if (newDiagnosis.trim()) {
      const newDiag: DiagnosisItem = {
        id: `diagnosis-${Date.now()}-${Math.random()}`,
        text: newDiagnosis.trim(),
        isMain: diagnoses.length === 0, // First diagnosis is automatically main
      };
      setDiagnoses([...diagnoses, newDiag]);
      setNewDiagnosis('');
    }
  };

  const updateDiagnosisText = (id: string, text: string) => {
    setDiagnoses(
      diagnoses.map((d) => (d.id === id ? { ...d, text } : d))
    );
  };

  const removeDiagnosis = (id: string) => {
    const diagnosisToRemove = diagnoses.find((d) => d.id === id);
    const newDiagnoses = diagnoses.filter((d) => d.id !== id);
    
    // If we removed the main diagnosis and there are other diagnoses, mark the first one as main
    if (diagnosisToRemove?.isMain && newDiagnoses.length > 0) {
      newDiagnoses[0].isMain = true;
    }
    
    setDiagnoses(newDiagnoses);
  };

  const handleMainDiagnosisChange = (id: string, checked: boolean) => {
    if (checked) {
      // Unset all other main diagnoses and set this one
      setDiagnoses(
        diagnoses.map((d) => ({
          ...d,
          isMain: d.id === id,
        }))
      );
    } else {
      // Don't allow unchecking if it's the only diagnosis
      if (diagnoses.length === 1) {
        return;
      }
      // If unchecking, set the first other diagnosis as main
      const otherDiagnoses = diagnoses.filter((d) => d.id !== id);
      if (otherDiagnoses.length > 0) {
        setDiagnoses(
          diagnoses.map((d) => ({
            ...d,
            isMain: d.id === otherDiagnoses[0].id,
          }))
        );
      }
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      // Check if allergy already exists (case-insensitive)
      const exists = allergies.some(
        (a) => a.text.toLowerCase().trim() === newAllergy.toLowerCase().trim()
      );
      if (!exists) {
        const newAllergyItem: AllergyItem = {
          id: `allergy-${Date.now()}-${Math.random()}`,
          text: newAllergy.trim(),
        };
        setAllergies([...allergies, newAllergyItem]);
        setNewAllergy('');
      }
    }
  };

  const updateAllergyText = (id: string, text: string) => {
    setAllergies(
      allergies.map((a) => (a.id === id ? { ...a, text } : a))
    );
  };

  const removeAllergy = (id: string) => {
    setAllergies(allergies.filter((a) => a.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? t('patients.editPatient') : t('patients.addPatient')}
          </DialogTitle>
          <DialogDescription>
            {patient
              ? 'Bearbeiten Sie die Patientendaten hier.'
              : 'Fügen Sie einen neuen Patienten hinzu.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.firstName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.lastName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.dateOfBirth')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.gender')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">{t('patients.male')}</SelectItem>
                        <SelectItem value="female">{t('patients.female')}</SelectItem>
                        <SelectItem value="other">{t('patients.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.weight')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.roomNumber')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel>{t('patients.diagnoses')}</FormLabel>
              
              {/* List of existing diagnoses */}
              <div className="space-y-2">
                {diagnoses.map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <Input
                      value={diagnosis.text}
                      onChange={(e) =>
                        updateDiagnosisText(diagnosis.id, e.target.value)
                      }
                      placeholder={t('patients.diagnosisText')}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`main-${diagnosis.id}`}
                        checked={diagnosis.isMain}
                        onCheckedChange={(checked) =>
                          handleMainDiagnosisChange(
                            diagnosis.id,
                            checked === true
                          )
                        }
                      />
                      <label
                        htmlFor={`main-${diagnosis.id}`}
                        className="text-sm cursor-pointer whitespace-nowrap"
                      >
                        {t('patients.setAsMainDiagnosis')}
                      </label>
                      {diagnosis.isMain && (
                        <Badge variant="default" className="ml-1">
                          {t('patients.main')}
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeDiagnosis(diagnosis.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new diagnosis */}
              <div className="flex gap-2">
                <Input
                  placeholder={t('patients.addDiagnosisPlaceholder')}
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDiagnosis();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDiagnosis}
                  disabled={!newDiagnosis.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <FormLabel>{t('patients.allergies')}</FormLabel>
              
              {/* List of existing allergies */}
              <div className="space-y-2">
                {allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <Input
                      value={allergy.text}
                      onChange={(e) =>
                        updateAllergyText(allergy.id, e.target.value)
                      }
                      placeholder={t('patients.allergyText')}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeAllergy(allergy.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add new allergy */}
              <div className="flex gap-2">
                <Input
                  placeholder={t('patients.addAllergyPlaceholder')}
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAllergy}
                  disabled={!newAllergy.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('patients.notes')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
