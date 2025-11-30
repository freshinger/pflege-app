import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Todo } from './todo.entity';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() todoData: Partial<Todo>) {
    return this.todosService.create(todoData);
  }

  @Get()
  findAll(
    @Query('patientId') patientId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('category') category?: string,
    @Query('completed') completed?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.todosService.search(search);
    }
    
    return this.todosService.findAll({
      patientId,
      assignedToId,
      category,
      completed: completed === 'true',
    });
  }

  @Get('overdue')
  getOverdue() {
    return this.todosService.getOverdueTodos();
  }

  @Get('upcoming')
  getUpcoming(@Query('hours') hours?: string) {
    const hoursNum = hours ? parseInt(hours) : 24;
    return this.todosService.getUpcomingTodos(hoursNum);
  }

  @Get('today')
  getToday() {
    return this.todosService.getTodayTodos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Todo>) {
    return this.todosService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
