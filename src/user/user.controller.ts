import { Controller, Get, Post, Param } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import { user as UserModel } from '@prisma/client';


@Controller('user')
export class UserController {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userService: UserService
    ) {}

    // 모든 유저 정보 조회
    @Get()
    async getAll(): Promise<UserModel[]> {
        return this.userService.getAll();
    }
    
    // ID로 정보 조회
    @Get(':id')
    async getAuth(@Param('id') id: string): Promise<UserModel> {
        return this.userService.getUser({ id: String(id) })
    }
}
