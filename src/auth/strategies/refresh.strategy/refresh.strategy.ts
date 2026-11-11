import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { User } from 'src/users/entities/user.entity';
import { createHash, timingSafeEqual } from 'node:crypto';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configServices: ConfigService,
    @InjectModel(User)
    private readonly usersModel: typeof User,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: configServices.getOrThrow<string>('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }
  async validate(req: any, payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersModel.findByPk(payload.sub);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid Refresh token.');
    }

    const incomingToken: unknown = req.body?.refreshToken;
    if (typeof incomingToken !== 'string')
      throw new UnauthorizedException('Invalid refresh token.');
    const digest = Buffer.from(
      createHash('sha256').update(incomingToken).digest('hex'),
    );
    const stored = Buffer.from(user.refreshToken);
    const isMatch =
      digest.length === stored.length && timingSafeEqual(digest, stored);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return payload;
  }
}
