import { CartService } from './cart.service';

describe('listing cart', () => {
  function fixture() {
    const item = {
      id: 1,
      listingId: 9,
      quantity: 2,
      update: jest.fn(async (v): Promise<void> => {
        Object.assign(item, v);
      }),
    };
    const items = {
      findOne: jest.fn(async ({ where }) => (where.cartId === 1 ? item : null)),
      create: jest.fn(),
    };
    const listing = {
      stock: 5,
      status: 'ACTIVE',
      $get: jest.fn(async () => ({ status: 'APPROVED' })),
    };
    const service: CartService = Reflect.construct(CartService, [
      {
        sequelize: {
          transaction: jest.fn(async (work) =>
            work({ LOCK: { UPDATE: 'UPDATE' } }),
          ),
        },
        findOrCreate: jest.fn(async ({ where }) => [{ id: where.userId }]),
      },
      items,
      { findByPk: jest.fn(async () => listing) },
      { findByPk: jest.fn(async () => ({ id: 1 })) },
    ]);
    return { service, item, listing };
  }
  it('adds quantity to the selected listing', async () => {
    const f = fixture();
    await f.service.create(1, { listingId: 9, quantity: 2 });
    expect(f.item.quantity).toBe(4);
  });
  it('rejects quantity above available stock', async () => {
    const f = fixture();
    await expect(
      f.service.create(1, { listingId: 9, quantity: 4 }),
    ).rejects.toThrow('stock');
    expect(f.item.quantity).toBe(2);
  });
  it('does not update a cart item owned by another user', async () => {
    const f = fixture();
    await expect(f.service.update(2, 1, { quantity: 1 })).rejects.toThrow(
      'Cart item not found',
    );
    expect(f.item.update).not.toHaveBeenCalled();
  });
});
