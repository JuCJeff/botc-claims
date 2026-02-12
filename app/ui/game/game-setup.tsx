'use client';

import { useLocalStorage } from 'usehooks-ts';
import { useEditionFilter } from '@/hooks/use-edition-filter';

import SelectEdition from './select-edition';
import AddPlayer from '../players/add-player';
import CharacterIconCloud from '../characters/character-icon-cloud';

import type { AutoCompleteItem } from '@/utils/types';

type GameSetupProps = {
  allCharacters: AutoCompleteItem[];
  editionImages: Record<string, string[]>;
  editionCharacterNames: Record<string, string[]>;
}

export default function GameSetup({
  allCharacters,
  editionImages,
  editionCharacterNames,
}: GameSetupProps) {
  const [selectedEditions, setSelectedEditions] = useLocalStorage<string[]>(
    'selectedEditions',
    [],
    { initializeWithValue: false },
  );

  const { filteredCharacters, shuffledIconImages } = useEditionFilter({
    selectedEditions,
    allCharacters,
    editionCharacterNames,
    editionImages,
  });

  return (
    <>
      <SelectEdition
        selectedEditions={selectedEditions}
        onSelectedEditionsChange={setSelectedEditions}
      />
      <AddPlayer characters={filteredCharacters} />

      {shuffledIconImages.length > 0 && (
        <CharacterIconCloud images={shuffledIconImages} />
      )}
    </>
  );
}
