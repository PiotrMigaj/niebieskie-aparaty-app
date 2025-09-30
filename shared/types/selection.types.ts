export interface Selection {
  selectionId: string;
  blocked: boolean;
  createdAt: string;
  eventId: string;
  eventTitle: string;
  maxNumberOfPhotos: number;
  selectedImages: string[];
  selectedNumberOfPhotos: number;
  updatedAt: string | null;
  username: string;
}

export interface SelectionItem {
    imageName: string;
    eventId: string;
    objectKey: string;
    presignedUrl: string;
    selected: boolean;
    selectionId: string;
    username: string;
    imageHeight: number;
    imageWidth: number;
    eventTitle: string;
}

export interface SelectionSubmitPayload {
  selectionId: string;
  eventId: string;
  eventTitle: string;
  selectedImages: string[];
}
