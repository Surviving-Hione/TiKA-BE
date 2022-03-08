import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { team, joinTeam, Prisma } from '@prisma/client';

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

    async getMaster(data: Prisma.teamWhereInput): Promise<team[] | null> {
        return this.prismaService.team.findMany({
            where : data
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
            where,
            data
        })
    }

    async deleteTeam(data: Prisma.teamWhereUniqueInput): Promise<team | null> {
        return this.prismaService.team.delete({
            where: data
        })
    }

    // joinTeam ---

    async getJoinTeam(data: Prisma.joinTeamWhereInput): Promise<joinTeam[] | null> {
        return this.prismaService.joinTeam.findMany({
            where: data
        })
    }

    async createJoinTeam(data: Prisma.joinTeamCreateInput): Promise<joinTeam | null> {
        return this.prismaService.joinTeam.create({
            data
        })
    }
}
