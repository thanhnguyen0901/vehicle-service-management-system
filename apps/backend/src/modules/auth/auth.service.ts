import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.userAccount.findUnique({
      where: { username: dto.username },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });

    const refreshToken = this.jwt.sign(
      { sub: user.id },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRES,
      },
    );

    // Hash refresh token before storing
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.prisma.userAccount.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, refreshToken: _rt, ...profile } = user;

    return { accessToken, refreshToken, user: profile };
  }

  async refresh(userId: string, incomingRefreshToken: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken || !user.isActive) {
      throw new ForbiddenException('Access denied');
    }

    const tokenMatch = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!tokenMatch) {
      throw new ForbiddenException('Refresh token invalid or expired');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });

    const newRefreshToken = this.jwt.sign(
      { sub: user.id },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRES,
      },
    );

    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
    await this.prisma.userAccount.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefresh },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
