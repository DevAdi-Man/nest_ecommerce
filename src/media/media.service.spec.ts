import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { MediaService } from './media.service';
import { MinioService } from './storage/minio.service';
import { Media } from './entities/media.entity';

const mockMinioService = {
  uploadFile: jest.fn(),
};

const mockMediaModel = {
  create: jest.fn(),
};

const mockFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
    ...overrides,
  }) as Express.Multer.File;

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: MinioService, useValue: mockMinioService },
        { provide: getModelToken(Media), useValue: mockMediaModel },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload()', () => {
    it('should throw BadRequestException if no file is provided', async () => {
      await expect(service.upload(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unsupported mime type', async () => {
      const file = mockFile({ mimetype: 'application/pdf' });
      await expect(service.upload(file)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file exceeds 5MB', async () => {
      const file = mockFile({ size: 6 * 1024 * 1024 });
      await expect(service.upload(file)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if MinIO upload fails', async () => {
      mockMinioService.uploadFile.mockRejectedValueOnce(
        new Error('MinIO down'),
      );
      const file = mockFile();
      await expect(service.upload(file)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should upload file, save to DB and return UploadedFileResponse', async () => {
      const minioResult = {
        fileName: 'test.jpg',
        objectKey: 'uuid.jpg',
        bucket: 'ecommerce',
        mimeType: 'image/jpeg',
        size: 1024,
        url: 'http://localhost:9000/ecommerce/uuid.jpg',
      };
      mockMinioService.uploadFile.mockResolvedValueOnce(minioResult);
      mockMediaModel.create.mockResolvedValueOnce({ id: 1, ...minioResult });

      const result = await service.upload(mockFile());

      expect(mockMinioService.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockMediaModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          objectKey: 'uuid.jpg',
          mimeType: 'image/jpeg',
        }),
      );
      expect(result).toMatchObject({ id: 1, url: minioResult.url });
    });
  });
});
