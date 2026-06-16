import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from './dto/user.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.userAccount.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.userAccount.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.userAccount.findUnique({
      where: { username: dto.username },
    });
    if (existing) throw new ConflictException('Username already taken');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.userAccount.create({
      data: {
        username: dto.username,
        passwordHash,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id); // 404 if not found

    return this.prisma.userAccount.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.userAccount.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    const match = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!match) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.prisma.userAccount.update({
      where: { id },
      data: { passwordHash: newHash, refreshToken: null },
    });

    return { message: 'Password changed successfully' };
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.prisma.userAccount.update({
      where: { id },
      data: { isActive: false, refreshToken: null },
      select: { id: true, isActive: true },
    });
  }
}
