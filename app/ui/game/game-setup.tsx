'use client';

import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { Button, Disclosure } from '@heroui/react';
import { useCharacterFilter } from '@/hooks/use-character-filter';

import SelectEdition from './select-edition';
import SelectCharacterType from './select-character-type';
import AddPlayer from '../players/add-player';
import CharacterIconCloud from '../characters/character-icon-cloud';

import type { AutoCompleteItem } from '@/utils/types';

type GameSetupProps = {
  allCharacters: AutoCompleteItem[];
  editionCharacterNames: Record<string, string[]>;
  typeCharacterNames: Record<string, string[]>;
  characterIconMap: Record<string, string>;
};

export default function GameSetup({
  allCharacters,
  editionCharacterNames,
  typeCharacterNames,
  characterIconMap,
}: GameSetupProps) {
  const [selectedEditions, setSelectedEditions] = useLocalStorage<string[]>(
    'selectedEditions',
    [],
    { initializeWithValue: false },
  );

  const [selectedTypes, setSelectedTypes] = useLocalStorage<string[]>(
    'selectedTypes',
    [],
    { initializeWithValue: false },
  );

  const { filteredCharacters, shuffledIconImages } = useCharacterFilter({
    selectedEditions,
    selectedTypes,
    allCharacters,
    editionCharacterNames,
    typeCharacterNames,
    characterIconMap,
  });

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  return (
    <>
      <div className='w-full max-w-sm my-2'>
        <Disclosure
          isExpanded={isFilterExpanded}
          onExpandedChange={setIsFilterExpanded}
        >
          <Disclosure.Heading>
            <Button
              slot='trigger'
              variant='primary'
              size='sm'
              className='bg-primary text-background'
            >
              <p className='text-xs'>Filters</p>
              <Disclosure.Indicator />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className='flex flex-col gap-2'>
              <SelectEdition
                selectedEditions={selectedEditions}
                onSelectedEditionsChange={setSelectedEditions}
              />
              <SelectCharacterType
                selectedTypes={selectedTypes}
                onSelectedTypesChange={setSelectedTypes}
              />
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      </div>
      <AddPlayer characters={filteredCharacters} />

      {/* Icon cloud will only appear if at least one of the filter is being selected */}
      {(selectedEditions.length > 0 || selectedTypes.length > 0) &&
        shuffledIconImages.length > 0 && (
          <CharacterIconCloud images={shuffledIconImages} />
        )}
    </>
  );
}
