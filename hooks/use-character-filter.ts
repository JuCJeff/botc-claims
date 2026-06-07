import { useMemo } from 'react';
import { shuffle } from 'lodash';
import { characterNamesToAutoCompleteItems } from '@/utils/formatters';

import type { AutoCompleteItem } from '@/utils/types';

type UseCharacterFilterProps = {
  selectedEditions: string[];
  selectedCharacterTypes: string[];
  allCharacters: AutoCompleteItem[];
  editionCharacterNames: Record<string, string[]>;
  typeCharacterNames: Record<string, string[]>;
  characterIconMap: Record<string, string>;
};

export function useCharacterFilter({
  selectedEditions,
  selectedCharacterTypes,
  allCharacters,
  editionCharacterNames,
  typeCharacterNames,
  characterIconMap,
}: UseCharacterFilterProps) {
  const filteredCharacters = useMemo(() => {
    const hasEditions = selectedEditions.length > 0;
    const hasTypes = selectedCharacterTypes.length > 0;

    if (!hasEditions && !hasTypes) return allCharacters;

    let editionNames: Set<string> | null = null;
    if (hasEditions) {
      editionNames = new Set(
        selectedEditions.flatMap(
          (edition) => editionCharacterNames[edition] ?? [],
        ),
      );
    }

    let typeNames: Set<string> | null = null;
    if (hasTypes) {
      typeNames = new Set(
        selectedCharacterTypes.flatMap(
          (type) => typeCharacterNames[type] ?? [],
        ),
      );
    }

    let intersected: string[];
    if (editionNames && typeNames) {
      intersected = [...editionNames].filter((name) => typeNames!.has(name));
    } else if (editionNames) {
      intersected = [...editionNames];
    } else {
      intersected = [...typeNames!];
    }

    return characterNamesToAutoCompleteItems(intersected);
  }, [
    selectedEditions,
    selectedCharacterTypes,
    allCharacters,
    editionCharacterNames,
    typeCharacterNames,
  ]);

  const shuffledIconImages = useMemo(() => {
    const names = filteredCharacters.map((c) => c.name);
    const icons = names.map((name) => characterIconMap[name]).filter(Boolean);
    return shuffle(icons);
  }, [filteredCharacters, characterIconMap]);

  return { filteredCharacters, shuffledIconImages };
}
