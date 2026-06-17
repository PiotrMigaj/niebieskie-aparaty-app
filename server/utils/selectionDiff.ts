import type { SelectionItem } from "~~/shared/types/selection.types";
import { SelectionItemRepositoryFactory } from "../repository/selectionItemRepository";

// Diffs incoming selectedImages against the current SelectionItem rows and
// emits one UpdateItem per row whose `selected` flag actually changes.
export const applySelectionDiff = async (
  username: string,
  eventId: string,
  currentItems: SelectionItem[],
  selectedImages: string[]
): Promise<void> => {
  const selectedSet = new Set(selectedImages);
  const repo = SelectionItemRepositoryFactory.getInstance();
  const changes = currentItems
    .filter((item) => item.selected !== selectedSet.has(item.imageName))
    .map((item) =>
      repo.setSelected(
        username,
        eventId,
        item.imageName,
        selectedSet.has(item.imageName)
      )
    );
  await Promise.all(changes);
};
