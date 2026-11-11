import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('category hierarchy', () => {
  it('rejects moving an ancestor underneath its descendant', async () => {
    const a = { id: 1, parentId: null, update: jest.fn() };
    const b = { id: 2, parentId: 1 };
    const model = { findByPk: jest.fn(async (id) => (id === 1 ? a : b)) };
    const service = new CategoriesService(model as unknown as typeof Category);
    await expect(service.update(1, { parentId: 2 })).rejects.toThrow();
    expect(a.update).not.toHaveBeenCalled();
  });
});
