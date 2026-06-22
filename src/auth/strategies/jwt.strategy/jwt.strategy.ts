import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectModel } from "@nestjs/sequelize";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/users/entities/user.entity";
import { JwtPayload } from '../../interfaces/jwtPayload.interface'
import { Role } from "src/roles/entities/role.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configServices: ConfigService,
        @InjectModel(User)
        private readonly userModel: typeof User
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configServices.get<string>('JWT_ACCESS_SECRET')!,
        })

    }

    async validate(payload: JwtPayload) {
        const user = await this.userModel.findByPk(payload.sub, {
            include: [Role]
        });

        if (!user) {
            throw new UnauthorizedException('User no longer exists.')
        }

        if (!user.role) {
            throw new UnauthorizedException('User role not found.')
        }

        return {
            sub: user.id,
            email: user.email,
            role: user.role.name
        }
    }
}
