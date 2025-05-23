import type { FileDto } from "./FileDto";

export interface EventDto {
  eventId: string;
  createdAt: string;
  date: string;
  description: string;
  imagePlaceholderObjectKey: string | null;
  title: string;
  username: string;
  files: FileDto[];
  galleryId: string | null;
}