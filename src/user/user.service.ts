import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { user, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUser(userWhereUniqueInput: Prisma.userWhereUniqueInput): Promise<user | null> {
    return this.prismaService.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async getAll(): Promise<user[] | null> {
    return this.prismaService.user.findMany();
  }

  async createUser(data: Prisma.userCreateInput): Promise<user | null> {
    return this.prismaService.user.create({
      data,
    });
  }

  async updateUser(params: { where: Prisma.userWhereUniqueInput; data: Prisma.userUpdateInput }): Promise<user | null> {
    const { where, data } = params;
    return this.prismaService.user.update({
      where,
      data,
    });
  }

  async deleteUser(data: Prisma.userWhereUniqueInput): Promise<user | null> {
    return this.prismaService.user.delete({
      where: data,
    });
  }
}
