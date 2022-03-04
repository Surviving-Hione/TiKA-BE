import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { team, Prisma } from '@prisma/client';

@Injectable()
export class TeamService {
    constructor(
        private readonly prismaService: PrismaService
    ) {}

    async getAll(): Promise<team[] | null> {
        return this.prismaService.team.findMany()
    }

    async getTeam(data: Prisma.teamWhereUniqueInput): Promise<team | null> {
        return this.prismaService.team.findUnique({
            where: data
        })
    }

    async createTeam(data: Prisma.teamCreateInput): Promise<team | null> {
        return this.prismaService.team.create({
            data
        })
    }

    async updateTeam(params: {
        where: Prisma.teamWhereUniqueInput;
        data: Prisma.teamUpdateInput;
    }): Promise<team | null> {
        const { where, data } = params;
        return this.prismaService.team.update({
            data,
            where
        })
    }

    async deleteTeam(data: Prisma.teamWhereUniqueInput): Promise<team | null> {
        return this.prismaService.team.delete({
            where: data
        })
    }

    
}
