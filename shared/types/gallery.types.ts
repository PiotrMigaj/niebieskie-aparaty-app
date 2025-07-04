export interface GalleryImage {
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
  url?: string;
}

export interface GalleryImageWithThumbnail extends GalleryImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
}

export interface GalleryDto {
  galleryId: string;
  createdAt: string;
  title: string;
  description: string;
  urlsSigningDate: string;
  username: string;
  images: GalleryImage[];
}

