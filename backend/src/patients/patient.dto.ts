import {Gender} from "./patient.entity";
import {Todo} from "../todos/todo.entity";

export class PatientDto {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    weight: number;
    gender: Gender;
    diagnoses: { text: string; isMain: boolean }[];
    allergies: string[];
    roomNumber: string;
    notes: string;
    todos: Todo[];
    createdAt: Date;
    updatedAt: Date;
    age: number;
}