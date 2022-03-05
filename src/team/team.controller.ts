import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { TeamService } from './team.service';
import { team as TeamModel } from '@prisma/client';

@Controller('team')
export class TeamController {
    constructor(
        private readonly teamService: TeamService
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

    @Get('code/:code') // Unique
    async getCode(@Param('code') code: string): Promise<TeamModel> {
        return this.teamService.getTeam({ code: String(code) })
    }

    @Post()
    async createTeam(
        @Body() data: { name: string, code: string, teamMaster: string } 
        ): Promise<TeamModel> {
        const { name, code, teamMaster } = data;
        return this.teamService.createTeam({
            name,
            code,
            user : {
                connect : { id : teamMaster}
            }
        })
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
                user : {
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
