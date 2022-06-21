import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { TeamController } from './team/team.controller';
import { TeamService } from './team/team.service';
import { JointeamController } from './jointeam/jointeam.controller';
import { JointeamService } from './jointeam/jointeam.service';
import { TodoService } from './todo/todo.service';
import { TodoController } from './todo/todo.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [
    UserController,
    TeamController,
    JointeamController,
    TodoController
  ],
  providers: [
    PrismaService,
    UserService,
    TeamService,
    JointeamService,
    TodoService
  ],
})
export class AppModule {}