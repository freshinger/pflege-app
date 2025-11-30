import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    message: string,
    todoId?: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      type,
      message,
      todoId,
    });
    return this.notificationsRepository.save(notification);
  }

  async findByUserId(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }
    
    return this.notificationsRepository.find({
      where,
      relations: ['todo'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationsRepository.update(id, {
      read: true,
      readAt: new Date(),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  async remove(id: string): Promise<void> {
    await this.notificationsRepository.delete(id);
  }
}
