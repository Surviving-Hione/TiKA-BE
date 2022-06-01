import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { joinTeam, Prisma } from '@prisma/client';

@Injectable()
export class JointeamService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(): Promise<joinTeam[] | null> {
    return this.prismaService.joinTeam.findMany();
  }

  // 특정 조건을 타겟으로 하여 검색할때는 controller에서 직접 탐색
  async getTarget(data: Prisma.joinTeamWhereInput): Promise<joinTeam[] | null> {
    return this.prismaService.joinTeam.findMany({
      where: data,
    });
  }

  async joinTeam(data: Prisma.joinTeamCreateInput): Promise<joinTeam | null> {
    return this.prismaService.joinTeam.create({
      data,
    });
  }

  async deletejoin(
    data: Prisma.joinTeamWhereUniqueInput,
  ): Promise<joinTeam | null> {
    return this.prismaService.joinTeam.delete({
      where: data,
    });
  }
}
