import { Controller, Get, Param } from '@nestjs/common';
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

    
    @Get(':id')
    async getUser(@Param('id') id: string): Promise<JoinTeamModel[]> {
        return this.joinTeamService.getTarget({
            userId: String(id)
        })
    }
}
