import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Todo } from '../todos/todo.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column('jsonb', { default: [] })
  diagnoses: { text: string; isMain: boolean }[];

  @Column('text', { array: true, default: [] })
  allergies: string[];

  @Column({ nullable: true })
  roomNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Todo, (todo) => todo.patient)
  todos: Todo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for age calculation
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
