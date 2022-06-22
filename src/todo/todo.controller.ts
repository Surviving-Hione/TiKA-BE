import { Controller, Get, Param } from '@nestjs/common';
import { TodoService } from './todo.service';
import { todo as TodoModel } from '@prisma/client';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getAll(): Promise<TodoModel[]> {
    return this.todoService.getAll();
  }

  @Get(':team')
  async teamTodo(@Param('team') team: string): Promise<TodoModel[]> {
    return this.todoService.teamTodo({
      teamcode: String(team),
    });
  }
}
