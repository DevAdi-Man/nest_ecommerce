import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

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

    const incommingToken = req.body.refreshToken;
    const isMatch = await bcrypt.compare(incommingToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return payload;
  }
}
