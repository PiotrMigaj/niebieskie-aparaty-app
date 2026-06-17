export type GalleryItemStatus = "processed" | "failed" | string;

export interface GalleryItem {
  imageName: string;
  originalFileName: string;
  webpUrl: string;
  originalUrl: string;
  width: number;
  height: number;
  compressedSize: number;
  status: GalleryItemStatus;
  failureReason: string | null;
  processedAt: string | null;
}
