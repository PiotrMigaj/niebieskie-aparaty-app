export interface FileDto {
  fileId: string;
  eventId: string;
  createdAt: string;
  dateOfLastDownload: string | null;
  description: string;
}

export interface FileWithObjectKeyDto {
  fileId: string;
  eventId: string;
  objectKey: string;
}
