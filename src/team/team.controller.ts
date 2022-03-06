import { Controller, Get, Param, Post, Body, Put, Delete, HttpCode, Res } from '@nestjs/common';
import { TeamService } from './team.service';
import { UserService } from '../user/user.service';
import { team as TeamModel } from '@prisma/client';

@Controller('team')
export class TeamController {
    constructor(
        private readonly teamService: TeamService,
        private readonly userService: UserService
    ) {}

    // 등록된 모든 팀 조회
    @Get()
    async getAll(): Promise<TeamModel[]> {
        return this.teamService.getAll();
    }

    // 해당 아이디가 팀장인 팀 찾기
    @Get(':master') 
    async getMaster(@Param('master') master: string): Promise<TeamModel[]> {
        return this.teamService.getMaster({ master: String(master) })
    }

    // 코드로 팀 조회
    @Get('code/:code') // Unique
    async getCode(@Param('code') code: string): Promise<TeamModel> {
        return this.teamService.getTeam({ code: String(code) })
    }

    // 팀 생성
    @Post()
    async createTeam(
        @Body() data: { name: string, teamMaster: string },
        @Res() res
    ): Promise<TeamModel> {
        const { name, teamMaster } = data;
        let teamCode = Math.random().toString(36).slice(2);
        // while (teamCode != (await this.teamService.getTeam({ code: String(teamCode) })).code) {
        //     teamCode = Math.random().toString(36).slice(2);
        // }
        if ((await this.userService.getUser({ id: String(teamMaster) })).masterCount <= 0) {
            return res.status(400).send({
                statusMsg: 'Created Fail',
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
            this.teamService.createTeam({
                name,
                code: teamCode,
                user: {
                    connect: { id: teamMaster }
                },
            })

            return res.status(200).send({
                statusMsg: 'Created Successfully',
                data: {
                    name,
                    code: teamCode,
                    user: {
                        connect: { id: teamMaster }
                    }
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
        @Param('code') code: string
    ): Promise<TeamModel> {
        return this.teamService.deleteTeam({ code: String(code) })
    }
}
