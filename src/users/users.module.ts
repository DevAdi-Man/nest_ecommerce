import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Role])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
