import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  it('passes request arguments to the service and returns its result', async () => {
    const dto = { id: 7 };
    const service = { findOne: jest.fn().mockResolvedValue(dto) };
    const controller = new CartController(service as unknown as CartService);
    const result = await controller.findOne({ user: { sub: 2 } } as any);
    expect(service.findOne).toHaveBeenCalledWith(2);
    expect(result).toEqual(dto);
  });
});
