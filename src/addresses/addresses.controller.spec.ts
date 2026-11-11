import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

describe('AddressesController', () => {
  it('passes request arguments to the service and returns its result', async () => {
    const dto = { id: 7 };
    const service = { findOne: jest.fn().mockResolvedValue(dto) };
    const controller = new AddressesController(
      service as unknown as AddressesService,
    );
    const result = await controller.findOne(7, { user: { sub: 2 } } as any);
    expect(service.findOne).toHaveBeenCalledWith(2, 7);
    expect(result).toEqual(dto);
  });
});
