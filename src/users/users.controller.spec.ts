import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  it('passes request arguments to the service and returns its result', async () => {
    const dto = { id: 7 };
    const service = { findOne: jest.fn().mockResolvedValue(dto) };
    const controller = new UsersController(service as unknown as UsersService);
    const result = await controller.findOne(7);
    expect(service.findOne).toHaveBeenCalledWith(7);
    expect(result).toEqual(dto);
  });
});
