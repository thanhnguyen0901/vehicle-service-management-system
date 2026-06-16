import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!mutatingMethods.includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          // Derive entity and action from URL pattern e.g. /api/v1/users → entity=User
          const segments = url.replace(/^\/api\/v1\//, '').split('/');
          const entity = this.toEntityName(segments[0]);
          const entityId = segments[1] && this.isUuid(segments[1]) ? segments[1] : null;
          const action = this.methodToAction(method, entityId);

          await this.prisma.auditLog.create({
            data: {
              userId: user?.id ?? null,
              action,
              entity,
              entityId: entityId ?? null,
              after: responseBody ? (responseBody as object) : undefined,
              ipAddress: ip ?? null,
              userAgent: headers['user-agent'] ?? null,
            },
          });
        } catch {
          // Audit logging must never break the main response
        }
      }),
    );
  }

  private toEntityName(segment: string): string {
    return segment
      .replace(/-./g, (m) => m[1].toUpperCase())
      .replace(/^\w/, (c) => c.toUpperCase())
      .replace(/s$/, '');
  }

  private methodToAction(method: string, entityId: string | null): string {
    const map: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return map[method] ?? 'UNKNOWN';
  }

  private isUuid(s: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  }
}
