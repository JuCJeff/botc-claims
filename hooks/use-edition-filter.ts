import { useMemo } from 'react';
import { shuffle } from 'lodash';
import { characterNamesToAutoCompleteItems } from '@/utils/formatters';

import type { AutoCompleteItem } from '@/utils/types';

type UseEditionFilterProps = {
  selectedEditions: string[];
  allCharacters: AutoCompleteItem[];
  editionCharacterNames: Record<string, string[]>;
  editionImages: Record<string, string[]>;
};

export function useEditionFilter({
  selectedEditions,
  allCharacters,
  editionCharacterNames,
  editionImages,
}: UseEditionFilterProps) {
  const filteredCharacters = useMemo(() => {
    if (selectedEditions.length === 0) return allCharacters;

    const names = selectedEditions.flatMap(
      (edition) => editionCharacterNames[edition] ?? [],
    );
    return characterNamesToAutoCompleteItems(names);
  }, [selectedEditions, allCharacters, editionCharacterNames]);

  const shuffledIconImages = useMemo(
    () =>
      shuffle(
        selectedEditions.flatMap((edition) => editionImages[edition] ?? []),
      ),
    [selectedEditions, editionImages],
  );

  return { filteredCharacters, shuffledIconImages };
}
