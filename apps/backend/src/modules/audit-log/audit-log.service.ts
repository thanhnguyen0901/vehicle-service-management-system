import { Injectable } from '@nestjs/common';
import { Prisma, Role, UserAccount } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogQueryDto } from './dto/audit-log.dto';

const auditLogSelect = {
  id: true,
  userId: true,
  action: true,
  entity: true,
  entityId: true,
  before: true,
  after: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
    },
  },
} satisfies Prisma.AuditLogSelect;

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: AuditLogQueryDto, user: UserAccount) {
    const keyword = query.search?.trim();
    const isFullAccess = user.role === Role.Admin || user.role === Role.Manager;
    const to = query.to ? new Date(query.to) : undefined;
    if (to) to.setHours(23, 59, 59, 999);
    const keywordIsUuid = keyword ? this.isUuid(keyword) : false;

    return this.prisma.auditLog.findMany({
      where: {
        userId: isFullAccess ? query.userId : user.id,
        action: query.action || undefined,
        entity: query.entity || undefined,
        createdAt:
          query.from || query.to
            ? {
                gte: query.from,
                lte: to,
              }
            : undefined,
        ...(keyword
          ? {
              OR: [
                { action: { contains: keyword, mode: 'insensitive' } },
                { entity: { contains: keyword, mode: 'insensitive' } },
                ...(keywordIsUuid ? [{ entityId: keyword }] : []),
                {
                  user: {
                    OR: [
                      { username: { contains: keyword, mode: 'insensitive' } },
                      { fullName: { contains: keyword, mode: 'insensitive' } },
                    ],
                  },
                },
              ],
            }
          : {}),
      },
      select: auditLogSelect,
      orderBy: { createdAt: 'desc' },
      take: query.take,
    });
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
}
