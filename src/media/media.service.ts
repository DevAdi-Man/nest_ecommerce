import { Injectable } from '@nestjs/common';
import { MinioService } from './storage/minio.service';

@Injectable()
export class MediaService {
  constructor(private readonly minioService: MinioService) {}
  async upload(file: Express.Multer.File) {
    return this.minioService.uploadFile(file);
  }
}
