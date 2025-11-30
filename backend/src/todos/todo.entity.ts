import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { User } from '../users/user.entity';

export enum TodoCategory {
  BEATMUNG = 'Beatmung',
  ERNAEHRUNG = 'Ernährung',
  BEWEGUNG = 'Bewegung',
  AUSSCHEIDUNG = 'Ausscheidung',
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TodoCategory,
  })
  category: TodoCategory;

  @Column({
    type: 'enum',
    enum: TodoPriority,
    default: TodoPriority.MEDIUM,
  })
  priority: TodoPriority;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ default: false })
  notificationSent: boolean;

  @ManyToOne(() => Patient, (patient) => patient.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => User, (user) => user.todos, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ nullable: true })
  assignedToId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
