import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Media } from './entities/media.entity';
import { MinioService } from './storage/minio.service';
import { UploadedFileResponse } from './interfaces/uploaded-file.interface';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectModel(Media) private readonly mediaModel: typeof Media,
    private readonly minioService: MinioService,
  ) {}

  async upload(file: Express.Multer.File): Promise<UploadedFileResponse> {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type "${file.mimetype}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File size exceeds the 5MB limit. Received: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    let uploadResult: Awaited<ReturnType<MinioService['uploadFile']>>;

    try {
      uploadResult = await this.minioService.uploadFile(file);
    } catch (error) {
      this.logger.error('MinIO upload failed', error);
      throw new InternalServerErrorException(
        'File upload failed. Please try again.',
      );
    }

    const media = await this.mediaModel.create({
      fileName: uploadResult.fileName,
      objectKey: uploadResult.objectKey,
      url: uploadResult.url,
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      bucket: uploadResult.bucket,
    });

    return {
      id: media.id,
      fileName: media.fileName,
      objectKey: media.objectKey,
      url: media.url,
      mimeType: media.mimeType,
      size: media.size,
      bucket: media.bucket,
    };
  }
}
