import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan, MoreThan, Between } from 'typeorm';
import { Todo, TodoPriority } from './todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
  ) {}

  async create(todoData: Partial<Todo>): Promise<Todo> {
    const todo = this.todosRepository.create(todoData);
    return this.todosRepository.save(todo);
  }

  async findAll(filters?: {
    patientId?: string;
    assignedToId?: string;
    category?: string;
    completed?: boolean;
  }): Promise<Todo[]> {
    const where: any = {};
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters?.category) where.category = filters.category;
    if (filters?.completed !== undefined) where.completed = filters.completed;

    return this.todosRepository.find({
      where,
      relations: ['patient', 'assignedTo'],
      order: { dueDate: 'ASC' },
    });
  }

  async findById(id: string): Promise<Todo> {
    const todo = await this.todosRepository.findOne({
      where: { id },
      relations: ['patient', 'assignedTo'],
    });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  async search(query: string): Promise<Todo[]> {
    return this.todosRepository.find({
      where: [
        { title: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      relations: ['patient', 'assignedTo'],
    });
  }

  async update(id: string, updateData: Partial<Todo>): Promise<Todo> {
    const todo = await this.findById(id);
    
    if (updateData.completed && !todo.completed) {
      updateData.completedAt = new Date();
    }
    
    Object.assign(todo, updateData);
    return this.todosRepository.save(todo);
  }

  async remove(id: string): Promise<void> {
    const result = await this.todosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Todo not found');
    }
  }

  async getOverdueTodos(): Promise<Todo[]> {
    const now = new Date();
    return this.todosRepository.find({
      where: {
        completed: false,
        dueDate: LessThan(now),
      },
      relations: ['patient', 'assignedTo'],
    });
  }

  async getUpcomingTodos(hours: number = 24): Promise<Todo[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return this.todosRepository.find({
      where: {
        completed: false,
        dueDate: MoreThan(now),
        notificationSent: false,
      },
      relations: ['patient', 'assignedTo'],
    });
  }

  async getTodayTodos(): Promise<Todo[]> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    return this.todosRepository.find({
      where: {
        completed: false,
        dueDate: Between(startOfToday, endOfToday),
      },
      relations: ['patient', 'assignedTo'],
      order: { dueDate: 'ASC' },
    });
  }

  async markNotificationSent(id: string): Promise<void> {
    await this.todosRepository.update(id, { notificationSent: true });
  }
}
