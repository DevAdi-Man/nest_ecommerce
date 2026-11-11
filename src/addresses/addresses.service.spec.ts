import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';

describe('address ownership', () => {
  it('does not return another user address', async () => {
    const model = {
      findOne: jest.fn(async ({ where }) =>
        where.userId === 1 ? { id: 7 } : null,
      ),
    };
    const service = new AddressesService(
      model as unknown as typeof Address,
      {} as typeof User,
    );
    await expect(service.findOne(2, 7)).rejects.toThrow('Address not found');
    await expect(service.findOne(1, 7)).resolves.toMatchObject({
      address: { id: 7 },
    });
  });
});
