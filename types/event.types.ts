import type { FileDto } from "./file.types";

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
  camelGallery: string | null;
  selectionAvailable?: boolean; 
}
