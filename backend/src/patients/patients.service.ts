import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './patient.entity';
import {PatientDto} from "./patient.dto";

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(patientData: Partial<Patient>): Promise<Patient> {
    // Ensure only one diagnosis is marked as main
    if (patientData.diagnoses) {
      this.ensureSingleMainDiagnosis(patientData.diagnoses);
    }
    const patient = this.patientsRepository.create(patientData);
    return this.patientsRepository.save(patient);
  }

  async findAll(): Promise<PatientDto[]> {
    return await this.patientsRepository.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    }).then((patients) => patients.map((patient) => ({
      ...patient,
      age: patient.age,
    })));
  }

  async findById(id: string): Promise<PatientDto> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['todos'],
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return {...patient, age: patient.age };
  }

  async search(query: string): Promise<Patient[]> {
    // Search in firstName, lastName, and diagnoses text fields
    const allPatients = await this.patientsRepository.find();
    return allPatients.filter((patient) => {
      const matchesName =
        patient.firstName.toLowerCase().includes(query.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(query.toLowerCase());
      const matchesDiagnosis = patient.diagnoses?.some((diagnosis) =>
        diagnosis.text.toLowerCase().includes(query.toLowerCase())
      );
      return matchesName || matchesDiagnosis;
    });
  }

  async update(id: string, updateData: Partial<Patient>): Promise<Patient> {
    // Ensure only one diagnosis is marked as main
    if (updateData.diagnoses) {
      this.ensureSingleMainDiagnosis(updateData.diagnoses);
    }
    const patient = await this.findById(id);
    Object.assign(patient, updateData);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const result = await this.patientsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Patient not found');
    }
  }

  async getStatistics() {
    const patients = await this.patientsRepository.find({
      relations: ['todos'],
    });

    const statistics = patients.map((patient) => ({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      visitCount: patient.todos.length,
      diagnoses: patient.diagnoses?.map((d) => d.text) || [],
    }));

    return statistics.sort((a, b) => b.visitCount - a.visitCount);
  }

  private ensureSingleMainDiagnosis(
    diagnoses: { text: string; isMain: boolean }[],
  ): void {
    // Find all main diagnoses
    const mainDiagnoses = diagnoses.filter((d) => d.isMain);
    // If more than one is marked as main, keep only the first one
    if (mainDiagnoses.length > 1) {
      let foundFirst = false;
      diagnoses.forEach((diagnosis) => {
        if (diagnosis.isMain) {
          if (foundFirst) {
            diagnosis.isMain = false;
          } else {
            foundFirst = true;
          }
        }
      });
    }
    // If no diagnosis is marked as main and there are diagnoses, mark the first one
    if (mainDiagnoses.length === 0 && diagnoses.length > 0) {
      diagnoses[0].isMain = true;
    }
  }
}
