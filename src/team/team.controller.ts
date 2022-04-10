import { Controller, Get, Param, Post, Body, Put, Delete, HttpCode, Res } from '@nestjs/common';
import { TeamService } from './team.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { team as TeamModel } from '@prisma/client';

@Controller('team')
export class TeamController {
    constructor(
        private readonly teamService: TeamService,
        private readonly userService: UserService,
        private readonly prismaService: PrismaService
    ) {}

    // 등록된 모든 팀 조회
    @Get()
    async getAll(): Promise<TeamModel[]> {
        return this.teamService.getAll();
    }

    // 해당 아이디가 팀장인 팀 찾기
    @Get('/master/:master') 
    async getMaster(@Param('master') master: string): Promise<TeamModel[]> {
        return this.teamService.getMaster({ master: String(master) })
    }

    // 코드로 팀 조회
    @Get(':code') // Unique
    async getCode(@Param('code') code: string): Promise<TeamModel> {
        return this.teamService.getTeam({ code: String(code) })
    }

    // 팀 생성
    @Post()
    async createTeam(
        @Body() data: { name: string, teamMaster: string },
        @Res() res
    ): Promise<String> {
        const { name, teamMaster } = data;
        let teamCode = Math.random().toString(36).slice(2);
        // let teamCode = 'imwyxldo0r';

        // TeamCode 유효성 검사...
        // getTeam 조회 시, 아무것도 없는 공백이 나오기때문에 현상 발생
        // while (this.teamService.getTeam({ code: String(teamCode)}) != null) {
        //     teamCode = Math.random().toString(36).slice(2);
        // }

        // 팀 마스터 유저가 생성권을 가지고 있지 않은 경우
        if ((await this.userService.getUser({ id: String(teamMaster) })).masterCount <= 0) {
            return res.status(400).send({
                statusMsg: 'Created Fail, Do not have MasterCount',
                name,
                code: teamCode,
                user: {
                    connect: { id: teamMaster }
                }
            })
        }

        else {
            // user masterCount - 1
            this.userService.updateUser({
                where: { id: String(teamMaster) },
                data: {
                    masterCount: (await this.userService.getUser({ id: String(teamMaster) })).masterCount - 1
                }
            })
            // 팀 생성
            await this.teamService.createTeam({
                name,
                code: teamCode,
                user: {
                    connect: { id: teamMaster }
                },
            })
            // create JoinTeam Data
            this.teamService.createJoinTeam({
                user: {
                    connect: { id: teamMaster }
                },
                team: {
                    connect: { code: teamCode }
                }
            })

            return res.status(200).send({
                statusMsg: 'Created Successfully',
                data: {
                    name,
                    code: teamCode,
                    user: teamMaster
                }
            })
        }
    }

    @Put(':code')
    async publishTeam(
        @Param('code') code: string,
        @Body() teamData: {
            name: string,
            master: string
        }): Promise<TeamModel> {
        const { name, master } = teamData;
        return this.teamService.updateTeam({
            where: { code: String(code) },
            data: {
                name,
                user: {
                    connect: { id: master }
                }
            }
        })
    }

    @Delete(':code')
    async deleteTeam(
        @Param('code') code: string,
        @Res() res
    ): Promise<String> {
        this.teamService.deleteTeam({ code: String(code) })

        // delete joinTeam data
        this.prismaService.joinTeam.deleteMany({
            where: {
                team_code: code
            }
        })
        return res.status(200).send({
            statusMsg: 'Deleted Successfully',
        }) 
    }
}