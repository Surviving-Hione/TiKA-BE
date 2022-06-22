import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { todo, Prisma } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(): Promise<todo[] | null> {
    return this.prismaService.todo.findMany();
  }

  async teamTodo(data: Prisma.todoWhereInput): Promise<todo[] | null> {
    return this.prismaService.todo.findMany({
      where: data,
    });
  }
}
