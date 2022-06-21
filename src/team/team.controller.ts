import { Controller, Get, Param, Post, Body, Put, Delete, Res } from '@nestjs/common';
import { TeamService } from './team.service';
import { UserService } from '../user/user.service';
import { JointeamService } from 'src/jointeam/jointeam.service';
import { PrismaService } from '../prisma.service';
import { team as TeamModel } from '@prisma/client';

@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly userService: UserService,
    private readonly joinTeamService: JointeamService,
    private readonly prismaService: PrismaService,
  ) {}

  // 등록된 모든 팀 조회
  @Get()
  async getAll(): Promise<TeamModel[]> {
    return this.teamService.getAll();
  }

  // 해당 아이디가 팀장인 팀 찾기
  @Get('/master/:master')
  async getMaster(@Param('master') master: string): Promise<TeamModel[]> {
    return this.teamService.getMaster({ master: String(master) });
  }

  // 코드로 팀 조회
  @Get(':code') // Unique
  async getCode(@Param('code') code: string): Promise<TeamModel> {
    return this.teamService.getTeam({ code: String(code) });
  }

  // 팀 생성
  @Post()
  async createTeam(@Body() data: { name: string; teamMaster: string }, @Res() res): Promise<string> {
    const { name, teamMaster } = data;
    let teamCode = Math.random().toString(36).slice(2).toUpperCase();
    // let teamCode = 'imwyxldo0r';

    // TeamCode 유효성 검사...
    // getTeam 조회 시, 아무것도 없는 공백이 나오기때문에 현상 발생
    while (this.teamService.getTeam({ code: String(teamCode) }) == null) {
      teamCode = Math.random().toString(36).slice(2).toUpperCase();
    }

    // 팀 마스터 유저가 생성권을 가지고 있지 않은 경우
    if ((await this.userService.getUser({ id: String(teamMaster) })).masterCount <= 0) {
      return res.status(400).send({
        statusMsg: 'Created Fail, Do not have MasterCount',
        name,
        code: teamCode,
        user: {
          connect: { id: teamMaster },
        },
      });
    } else {
      // user masterCount - 1
      this.userService.updateUser({
        where: { id: String(teamMaster) },
        data: {
          masterCount: (await this.userService.getUser({ id: String(teamMaster) })).masterCount - 1,
        },
      });

      // 팀 생성
      // 비동기적으로 실행하여 팀 생성 전에 joinTeam 데이터가 생기는 것을 방지함
      await this.teamService.createTeam({
        name,
        code: teamCode,
        user: {
          connect: { id: teamMaster },
        },
      });
      // create JoinTeam Data
      this.teamService.createJoinTeam({
        user: {
          connect: { id: teamMaster },
        },
        team: {
          connect: { code: teamCode },
        },
      });

      return res.status(200).send({
        statusMsg: 'Created Successfully',
        data: {
          name,
          code: teamCode,
          user: teamMaster,
        },
      });
    }
  }

  // 팀명 변경
  @Put('/name/:code')
  async publishTeam(
    @Param('code') code: string,
    @Body()
    teamData: {
      name: string;
    },
  ): Promise<TeamModel> {
    const name = teamData.name;
    return this.teamService.updateTeam({
      where: { code: String(code) },
      data: {
        name,
      },
    });
  }

  // 팀장 변경
  @Put('/master/:code')
  async publishTeamMaster(
    @Param('code') code: string,
    @Res() res,
    @Body()
    teamData: {
      master: string;
    },
  ): Promise<string> {
    const master = teamData.master;

    // 변경될 팀의 데이터
    const changeTeam = await this.teamService.getTeam({ code: String(code) });
    // 변경할 팀장의 데이터
    const changeMaster = await this.userService.getUser({ id: String(master) });
    // 변경될 팀의 가입 정보
    const joinTeamData = await this.joinTeamService.getTarget({ team_code: String(code) });

    // 기존 팀장과 변경할 팀장이 같지 않은지 확인
    if (changeTeam.master == master) {
      return res.status(400).send({
        statusMsg: 'Change Failed, Change target and team master are the same.',
        data: {
          code,
          master,
          changeTeam,
        },
      });
    }

    // 해당 팀에 변경할 팀장이 가입되어 있는지 확인
    // let member = [];
    // let count = 0;
    // for (let i = 0; i < joinTeamData.length; i++) {
    //   member[count++] = joinTeamData[i].userId;
    // }

    // 해당 팀에 변경할 팀장이 가입되어 있는지 유효성 검사
    const joinedMaster = joinTeamData.find((element) => element.userId == master);
    // console.log(joinedMaster);
    // 가입되어 있지 않으면..
    if (joinedMaster == undefined) {
      return res.status(400).send({
        statusMsg: 'Change Failed, The team master you want to change is not joined to the team.',
        data: {
          code,
          master,
          joinTeamData,
        },
      });
    }

    // 변경할 팀장의 masterCount가 1보다 적을때
    if (changeMaster.masterCount < 1) {
      return res.status(400).send({
        statusMsg: 'Change Failed, Do not have MasterCount.',
        data: {
          code,
          master,
          changeMaster,
        },
      });
    }

    // 팀장 변경
    this.teamService.updateTeam({
      where: { code: String(code) },
      data: {
        user: {
          connect: { id: master },
        },
      },
    });

    // 기존 팀장의 masterCount + 1 복원
    this.userService.updateUser({
      where: { id: String(changeTeam.master) },
      data: {
        masterCount: (await this.userService.getUser({ id: String(changeTeam.master) })).masterCount + 1,
      },
    });

    // 변경된 팀장의 masterCount - 1
    this.userService.updateUser({
      where: { id: String(master) },
      data: {
        masterCount: (await this.userService.getUser({ id: String(master) })).masterCount - 1,
      },
    });

    return res.status(200).send({
      statusMsg: 'Changed Successfully',
      data: {
        code,
        master,
        changeTeam,
      },
    });
  }

  // 해당 팀 삭제
  @Delete(':code')
  async deleteTeam(@Param('code') code: string, @Res() res): Promise<TeamModel> {
    const obj = await this.joinTeamService.getTarget({ team_code: String(code) });
    const count = Object.keys(obj).length;

    // 해당 팀에 마스터 외에 사람이 있을 경우 삭제가 안되게
    if (count >= 2) {
      return res.status(500).send({
        statusMsg: 'Deleted Failed, There are remaining team members.',
        data: obj,
      });
      // 해당 팀에 1명 이내 (팀 마스터)가 있을 경우 해당 joinTeam Data 삭제하고 Team 삭제
    } else if (count <= 1) {
      this.joinTeamService.deletejoin({
        no: obj[0].no,
      });

      await this.teamService.deleteTeam({ code: String(code) });

      return res.status(200).send({
        statusMsg: 'Deleted Successfully',
      });
    }
  }
}
