import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JointeamService } from './jointeam.service';
import { joinTeam as JoinTeamModel } from '@prisma/client';

@Controller('jointeam')
export class JointeamController {
    constructor(
        private readonly joinTeamService: JointeamService
    ) {}

    // DB내의 모든 팀가입 이력 조회
    @Get()
    async getAll(): Promise<JoinTeamModel[]> {
        return this.joinTeamService.getAll()
    }

    // 해당 ID로 가입된 팀 조회
    @Get(':id')
    async getUser(@Param('id') id: string): Promise<JoinTeamModel[]> {
        return this.joinTeamService.getTarget({
            userId: String(id)
        })
    }

    @Post()
    async addJoinTeam(
        @Body() joinData: {
            userId: string,
            team_code: string
        }
    ): Promise<JoinTeamModel> {
        return this.joinTeamService.joinTeam({
            user: {
                connect: { id: joinData.userId }
            },
            team: {
                connect: { code: joinData.team_code }
            }
        })
    }
}
