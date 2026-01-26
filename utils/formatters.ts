import type { AutoCompleteItem } from './types';

export const characterNamesToAutoCompleteItems = (characterNames: string[]) => {
  const autoCompleteItems: AutoCompleteItem[] = [];

  characterNames.forEach((name) => {
    autoCompleteItems.push({
      id: name,
      name: name,
    });
  });

  return autoCompleteItems;
};
