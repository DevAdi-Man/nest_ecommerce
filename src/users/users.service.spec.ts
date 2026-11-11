import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { RolesService } from 'src/roles/roles.service';

describe('administrator bootstrap', () => {
  it('does not seed a known default administrator when credentials are absent', async () => {
    const previousEmail = process.env.ADMIN_EMAIL;
    const previousPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    const users = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    const roles = { findOne: jest.fn().mockResolvedValue({ id: 1 }) };
    try {
      const service = new UsersService(
        users as unknown as typeof User,
        roles as unknown as typeof Role,
        {} as RolesService,
      );
      await service.onModuleInit();
      expect(users.create).not.toHaveBeenCalled();
    } finally {
      if (previousEmail === undefined) delete process.env.ADMIN_EMAIL;
      else process.env.ADMIN_EMAIL = previousEmail;
      if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
      else process.env.ADMIN_PASSWORD = previousPassword;
    }
  });
});
