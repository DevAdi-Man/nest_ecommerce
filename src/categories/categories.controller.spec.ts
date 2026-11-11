import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  it('passes request arguments to the service and returns its result', async () => {
    const dto = { id: 7 };
    const service = { findOne: jest.fn().mockResolvedValue(dto) };
    const controller = new CategoriesController(
      service as unknown as CategoriesService,
    );
    const result = await controller.findOne(7);
    expect(service.findOne).toHaveBeenCalledWith(7);
    expect(result).toEqual(dto);
  });
});
