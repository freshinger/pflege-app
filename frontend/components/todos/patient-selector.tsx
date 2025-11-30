'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, ChevronDown } from 'lucide-react';
import { Patient } from '@/lib/types';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PatientSelectorProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

export function PatientSelector({
  selectedPatient,
  onPatientSelect,
}: PatientSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchPatients();
      // Focus input when popover opens
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch('');
    }
  }, [open]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Patient[]>('/patients', {
        params: search ? { search } : {},
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && search) {
      const debounce = setTimeout(() => {
        fetchPatients();
      }, 300);
      return () => clearTimeout(debounce);
    } else if (open) {
      fetchPatients();
    }
  }, [search]);

  const filteredPatients = patients.filter((patient) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      `${patient.lastName}, ${patient.firstName}`.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onPatientSelect(null);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPatient
            ? `${selectedPatient.lastName}, ${selectedPatient.firstName}`
            : t('todos.selectPatient')}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={t('todos.searchPatient')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <div className="p-1">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className={cn(
                    'w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground',
                    selectedPatient?.id === patient.id && 'bg-accent'
                  )}
                >
                  {patient.lastName}, {patient.firstName}
                  {patient.roomNumber && (
                    <span className="text-muted-foreground ml-2">
                      ({patient.roomNumber})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedPatient && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              {t('todos.clearSelection')}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

