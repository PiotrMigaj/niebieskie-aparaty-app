export const TABLE_NAME = process.env.DYNAMODB_TABLE ?? "niebieskie-aparaty-prod";

export const userPk = (username: string) => `USER#${username}`;
export const profileSk = () => "#PROFILE";

export const eventSk = (eventId: string) => `EVENT#${eventId}`;
export const eventSkPrefix = () => "EVENT#";

export const gallerySk = (eventId: string) => `GALLERY#${eventId}`;

export const galleryItemSk = (eventId: string, imageName: string) =>
  `GALLERY_ITEM#${eventId}#${imageName}`;
export const galleryItemSkPrefix = (eventId: string) =>
  `GALLERY_ITEM#${eventId}#`;

export const selectionSk = (eventId: string) => `SELECTION#${eventId}`;

export const selectionItemSk = (eventId: string, imageName: string) =>
  `SELECTION_ITEM#${eventId}#${imageName}`;
export const selectionItemSkPrefix = (eventId: string) =>
  `SELECTION_ITEM#${eventId}#`;

export const fileSk = (eventId: string, fileId: string) =>
  `FILE#${eventId}#${fileId}`;
export const fileSkPrefix = (eventId: string) => `FILE#${eventId}#`;
