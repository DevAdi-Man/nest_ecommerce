import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'File to upload. Allowed types: image/jpeg, image/png, image/webp, image/gif. Max size: 5MB.',
  })
  file: Express.Multer.File;
}
