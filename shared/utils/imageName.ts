// Strips the trailing file extension from an imageName so the UI can show a
// human-readable label. The raw imageName is still required for DynamoDB SKs
// and object reads — never strip for those.
//   "IMG_0004.jpg" -> "IMG_0004"
//   "IMG_4896"     -> "IMG_4896"
export const toDisplayName = (imageName: string): string =>
  imageName.replace(/\.[^.]+$/, "");
