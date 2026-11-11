import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  it('passes request arguments to the service and returns its result', async () => {
    const dto = { id: 7 };
    const service = { findOne: jest.fn().mockResolvedValue(dto) };
    const controller = new RolesController(service as unknown as RolesService);
    const result = await controller.findOne(7);
    expect(service.findOne).toHaveBeenCalledWith(7);
    expect(result).toEqual(dto);
  });
});
