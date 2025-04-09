export interface FileDto {
  fileId: string;
  createdAt: string;
  dateOfLastDownload: string | null;
  description: string;
}

export interface FileWithObjectKeyDto {
  fileId: string;
  objectKey: string;
}
