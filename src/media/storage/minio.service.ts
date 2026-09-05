import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Client } from 'minio';
import { IStorageService } from './storage.interface';

@Injectable()
export class MinioService implements OnModuleInit, IStorageService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly bucketName: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('MINIO_BUCKET');
    this.endpoint = this.configService.getOrThrow<string>('MINIO_ENDPOINT');
    this.port = this.configService.getOrThrow<number>('MINIO_PORT');
    this.useSSL = this.configService.get<boolean>('MINIO_USE_SSL') ?? false;

    this.client = new Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    const bucketExists = await this.client.bucketExists(this.bucketName);

    if (!bucketExists) {
      await this.client.makeBucket(this.bucketName);
      this.logger.log(`Bucket "${this.bucketName}" created successfully.`);
    } else {
      this.logger.log(`Bucket "${this.bucketName}" already exists.`);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const fileExtension = file.originalname.split('.').pop();
    const objectName = `${randomUUID()}.${fileExtension}`;

    await this.client.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const protocol = this.useSSL ? 'https' : 'http';
    const url = `${protocol}://${this.endpoint}:${this.port}/${this.bucketName}/${objectName}`;

    return {
      fileName: file.originalname,
      objectKey: objectName,
      bucket: this.bucketName,
      mimeType: file.mimetype,
      size: file.size,
      url,
    };
  }
}
