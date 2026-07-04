export interface UploadedFileResponse {
  id: number;

  fileName: string;

  objectKey: string;

  url: string;

  mimeType: string;

  size: number;

  bucket: string;
}
