export interface IStorageService {
  uploadFile(file: Express.Multer.File): Promise<{
    fileName: string;
    objectKey: string;
    bucket: string;
    mimeType: string;
    size: number;
    url: string;
  }>;
}
