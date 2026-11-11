import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('passes request arguments to the service and returns its result', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '2000-01-01',
    };
    const service = { register: jest.fn().mockResolvedValue(dto) };
    const controller = new AuthController(service as unknown as AuthService);
    const result = await controller.register(dto);
    expect(service.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });
});
