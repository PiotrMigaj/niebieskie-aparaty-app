export interface Selection {
  selectionId: string;
  eventId: string;
  eventTitle: string;
  username: string;
  blocked: boolean;
  maxNumberOfPhotos: number;
  selectedNumberOfPhotos: number;
  selectedImages: string[];
  createdAt: string;
  updatedAt: string | null;
}

export interface SelectionItem {
  imageName: string;
  eventId: string;
  eventTitle: string;
  selectionId: string;
  username: string;
  url: string;
  imageWidth: number;
  imageHeight: number;
  selected: boolean;
}

interface SelectionBasePayload {
  selectionId: string;
  eventId: string;
  eventTitle: string;
  selectedImages: string[];
}

export interface SelectionSubmitPayload extends SelectionBasePayload {}

export interface SelectionSavePayload extends SelectionBasePayload {}
