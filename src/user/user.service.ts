import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { user, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async getUser(userWhereUniqueInput: Prisma.userWhereUniqueInput): Promise<user | null> {
        return this.prismaService.user.findUnique({ 
            where: userWhereUniqueInput
        });
    }

    async getAll(): Promise<user[] | null>{
        return this.prismaService.user.findMany();
    }
}
