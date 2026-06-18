import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const slug = dto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: dto.organizationName, slug: `${slug}-${Date.now()}` },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: UserRole.OWNER,
        },
      });

      return { user, org };
    });

    const token = this.signToken(result.user.id, result.user.email, result.org.id, UserRole.OWNER);

    return {
      accessToken: token,
      user: this.formatUser(result.user, result.org, UserRole.OWNER),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        memberships: { include: { organization: true }, take: 1 },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const membership = user.memberships[0];
    if (!membership) throw new UnauthorizedException('No organization found');

    const token = this.signToken(
      user.id,
      user.email,
      membership.organizationId,
      membership.role,
    );

    return {
      accessToken: token,
      user: this.formatUser(user, membership.organization, membership.role),
    };
  }

  async getMe(userId: string, organizationId: string) {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId, organizationId },
      include: { user: true, organization: true },
    });

    if (!membership) throw new UnauthorizedException();

    return this.formatUser(membership.user, membership.organization, membership.role);
  }

  private signToken(userId: string, email: string, organizationId: string, role: UserRole) {
    return this.jwt.sign({ sub: userId, email, organizationId, role });
  }

  private formatUser(
    user: { id: string; email: string; firstName: string; lastName: string; avatarUrl: string | null },
    org: { id: string; name: string },
    role: UserRole,
  ) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      organizationId: org.id,
      organizationName: org.name,
      role,
    };
  }
}
