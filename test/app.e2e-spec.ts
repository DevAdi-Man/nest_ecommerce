import { Test } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { MediaController } from '../src/media/media.controller';
import { MediaService } from '../src/media/media.service';
import { MinioService } from '../src/media/storage/minio.service';
import { Media } from '../src/media/entities/media.entity';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth/jwt-auth.guard';
import { getModelToken } from '@nestjs/sequelize';

describe('catalog and multipart HTTP boundaries', () => {
  let app: INestApplication;
  const update = jest.fn().mockResolvedValue({ message: 'Updated' });
  const uploadFile = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController, MediaController],
      providers: [
        {
          provide: ProductsService,
          useValue: { update, remove: update, deleteProductImage: update },
        },
        MediaService,
        { provide: MinioService, useValue: { uploadFile } },
        { provide: getModelToken(Media), useValue: { create: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext) {
          const req = context.switchToHttp().getRequest();
          const role = req.headers.authorization?.replace('Bearer ', '');
          if (!['Admin', 'Seller', 'Customer'].includes(role))
            throw new UnauthorizedException();
          req.user = { sub: 1, role };
          return true;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['patch', 'delete'] as const)(
    'blocks seller catalog %s',
    async (method) => {
      await request(app.getHttpServer())
        [method]('/products/1')
        .set('Authorization', 'Bearer Seller')
        .send({})
        .expect(403);
      expect(update).not.toHaveBeenCalled();
    },
  );
  it('blocks seller deletion of another catalog image', async () => {
    await request(app.getHttpServer())
      .delete('/products/1/images/2')
      .set('Authorization', 'Bearer Seller')
      .expect(403);
    expect(update).not.toHaveBeenCalled();
  });
  it('permits administrator catalog updates', async () => {
    await request(app.getHttpServer())
      .patch('/products/1')
      .set('Authorization', 'Bearer Admin')
      .send({ title: 'Updated product' })
      .expect(200);
    expect(update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ title: 'Updated product' }),
    );
  });
  it('rejects oversized multipart content before storage', async () => {
    await request(app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', 'Bearer Customer')
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'large.jpg',
        contentType: 'image/jpeg',
      })
      .expect(413);
    expect(uploadFile).not.toHaveBeenCalled();
  });
  it('rejects image MIME spoofing before storage', async () => {
    await request(app.getHttpServer())
      .post('/media/upload')
      .set('Authorization', 'Bearer Customer')
      .attach('file', Buffer.from('not an image'), {
        filename: 'fake.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400);
    expect(uploadFile).not.toHaveBeenCalled();
  });
});
