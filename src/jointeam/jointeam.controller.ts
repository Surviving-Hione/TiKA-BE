import { Body, Controller, Get, Param, Post, Delete, Res } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JointeamService } from './jointeam.service';
import { TeamService } from 'src/team/team.service';
import { joinTeam as JoinTeamModel } from '@prisma/client';

@Controller('jointeam')
export class JointeamController {
  constructor(
    private readonly joinTeamService: JointeamService,
    private readonly teamService: TeamService,
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
  async addJoinTeam(@Body() joinData: { userId: string; team_code: string }, @Res() res): Promise<JoinTeamModel> {
    const searchTarget = await this.joinTeamService.getTarget({
      userId: joinData.userId,
      team_code: joinData.team_code,
    });

    if (searchTarget.length > 1) {
      return res.status(500).send({
        statusMsg: 'are already subscribed.',
      });
    }

    this.joinTeamService.joinTeam({
      user: {
        connect: { id: joinData.userId },
      },
      team: {
        connect: { code: joinData.team_code },
      },
    });
    return res.status(200).send({
      statusMsg: 'Created Successfully',
    });
  }

  // 팀 탈퇴
  // 현재 해당 팀에 가입되어있는지, 유저측과 팀측에서 2중으로 확인해보기
  @Delete()
  async deleteJoinTeam(@Body() data: { userId: string; team_code: string }, @Res() res): Promise<string> {
    const userId = data.userId;
    const team_code = data.team_code;

    const deleteTarget = await this.joinTeamService.getTarget({
      userId: userId,
      team_code: team_code,
    });

    const masterTarget = await this.teamService.getTeam({
      code: team_code,
    });

    // 탈퇴하려는 사용자가 팀 마스터일 경우 500 리턴
    if (masterTarget.master == data.userId) {
      return res.status(500).send({
        statusMsg: 'Deleted Fail. This user is the Team Master',
      });
    }

    // 삭제 타겟이 0보다 낮거나 1 초과와 같으면 500 리턴
    if (deleteTarget.length > 1) {
      return res.status(500).send({
        statusMsg: 'Target Find Failed, The user is duplicate.',
      });
    } else if (deleteTarget.length == 0) {
      return res.status(500).send({
        statusMsg: 'Target Find Failed, The user could not be found.',
      });
    }

    this.joinTeamService.deletejoin({
      no: deleteTarget[0].no,
    });

    return res.status(200).send({
      statusMsg: 'Deleted Successfully',
      data: userId,
      team_code,
    });
  }
}
