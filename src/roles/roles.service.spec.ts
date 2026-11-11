import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';

describe('role lookup', () => {
  it('returns 404 for an unknown role', async () => {
    const service = new RolesService({
      findByPk: jest.fn().mockResolvedValue(null),
    } as unknown as typeof Role);
    await expect(service.findOne(99)).rejects.toThrow('Role not found');
  });
});
