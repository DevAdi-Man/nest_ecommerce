import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

const mockMediaService = {
  upload: jest.fn(),
};

const mockFile = (): Express.Multer.File =>
  ({
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test'),
  }) as Express.Multer.File;

describe('MediaController', () => {
  let controller: MediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: MediaService, useValue: mockMediaService }],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload()', () => {
    it('should delegate to MediaService.upload and return the result', async () => {
      const expectedResponse = {
        id: 1,
        fileName: 'test.jpg',
        objectKey: 'uuid.jpg',
        url: 'http://localhost:9000/ecommerce/uuid.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        bucket: 'ecommerce',
      };
      mockMediaService.upload.mockResolvedValueOnce(expectedResponse);

      const result = await controller.upload(mockFile());

      expect(mockMediaService.upload).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });
  });
});
