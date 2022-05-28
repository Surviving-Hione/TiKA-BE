import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Res,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JointeamService } from './jointeam.service';
import { joinTeam as JoinTeamModel } from '@prisma/client';

@Controller('jointeam')
export class JointeamController {
  constructor(
    private readonly joinTeamService: JointeamService,
    private readonly prismaServise: PrismaService,
  ) {}

  // DB내의 모든 팀가입 조회
  @Get()
  async getAll(): Promise<JoinTeamModel[]> {
    return this.joinTeamService.getAll();
  }

  // 해당 ID로 가입된 팀 조회
  @Get('/id/:id')
  async getUser(@Param('id') id: string): Promise<JoinTeamModel[]> {
    return this.joinTeamService.getTarget({
      userId: String(id),
    });
  }

  // 해당 팀에 가입 된 모든 유저 조회
  @Get('/team/:team')
  async getTeam(@Param('team') team: string): Promise<JoinTeamModel[]> {
    return this.joinTeamService.getTarget({
      team_code: String(team),
    });
  }

  //팀 가입
  @Post()
  async addJoinTeam(
    @Body() joinData: { userId: string; team_code: string },
  ): Promise<JoinTeamModel> {
    return this.joinTeamService.joinTeam({
      user: {
        connect: { id: joinData.userId },
      },
      team: {
        connect: { code: joinData.team_code },
      },
    });
  }

  // 팀 탈퇴
  // 현재 해당 팀에 가입되어있는지, 유저측과 팀측에서 2중으로 확인해보기
  @Delete()
  async deleteJoinTeam(
    @Body() data: { userId: string; team_code: string },
    @Res() res,
  ): Promise<String> {
    const userId = data.userId;
    const team_code = data.team_code;
    this.prismaServise.joinTeam.deleteMany({
      where: {
        userId: String(userId),
        team_code: String(team_code),
      },
    });

    return res.status(200).send({
      statusMsg: userId,
      team_code,
    });
  }
}
