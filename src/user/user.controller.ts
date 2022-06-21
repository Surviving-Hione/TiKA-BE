import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { user as UserModel } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 모든 유저 정보 조회
  @Get()
  async getAll(): Promise<UserModel[]> {
    return this.userService.getAll();
  }

  // ID로 정보 조회
  @Get(':id')
  async getAuth(@Param('id') id: string): Promise<UserModel> {
    return this.userService.getUser({ id: String(id) });
  }

  // 회원가입
  @Post()
  async createUser(
    @Body()
    userData: {
      id: string;
      pw: string;
      name: string;
      phone?: string;
      masterCount: 1;
      payment?: null;
    },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  // 회원정보 수정
  @Put(':id')
  async publishTeam(
    @Param('id') id: string,
    @Body()
    userData: {
      pw: string;
      name: string;
      phone: string;
    },
  ): Promise<UserModel> {
    const { pw, name, phone } = userData;
    return this.userService.updateUser({
      where: { id: String(id) },
      data: {
        pw,
        name,
        phone,
      },
    });
  }

  // ID로 회원 탈퇴
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<UserModel> {
    return this.userService.deleteUser({ id: String(id) });
  }
}
