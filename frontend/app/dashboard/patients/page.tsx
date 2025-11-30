'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { Patient } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PatientDialog } from '@/components/patients/patient-dialog';

export default function PatientsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get<Patient[]>('/patients', {
        params: { search },
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleCreate = () => {
    setSelectedPatient(null);
    setDialogOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setDialogOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      await apiClient.delete(`/patients/${patientToDelete.id}`);
      toast.success(t('common.success'));
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error(t('common.error'));
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedPatient) {
        await apiClient.put(`/patients/${selectedPatient.id}`, data);
        toast.success(t('common.success'));
      } else {
        await apiClient.post('/patients', data);
        toast.success(t('common.success'));
      }
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('patients.title')}</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('patients.addPatient')}
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('patients.name')}</TableHead>
              <TableHead>{t('patients.age')}</TableHead>
              <TableHead>{t('patients.roomNumber')}</TableHead>
              <TableHead>{t('patients.diagnoses')}</TableHead>
              <TableHead>{t('patients.allergies')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.lastName}, {patient.firstName}
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.roomNumber || '-'}</TableCell>
                  <TableCell>
                    {patient.diagnoses && patient.diagnoses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.diagnoses.map((diagnosis, i) => (
                          <Badge
                            key={i}
                            variant={diagnosis.isMain ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {diagnosis.text}
                            {diagnosis.isMain && (
                              <span className="ml-1 font-semibold">
                                ({t('patients.main')})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      t('patients.none')
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/todos?patientId=${patient.id}`)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {t('patients.viewTodos')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(patient)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(patient)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PatientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        patient={selectedPatient}
        onSubmit={handleSubmit}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('patients.deletePatient')}</DialogTitle>
            <DialogDescription>
              {patientToDelete
                ? `${t('patients.deletePatientConfirm')} "${patientToDelete.firstName} ${patientToDelete.lastName}"?`
                : t('common.confirmDelete')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPatientToDelete(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
