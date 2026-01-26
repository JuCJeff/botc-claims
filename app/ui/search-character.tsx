'use client';

import { useState, useEffect } from 'react';
import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from '@heroui/react';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { getCharactersByNames } from '@/lib/character-queries';
import CharacterToken from './character-token';

import type { Key } from '@heroui/react';
import type { AutoCompleteItem, Character } from '@/utils/types';
import type { ReactNode } from 'react';

type AutocompleteValueState = {
  selectedItems: Array<{
    key: Key;
  }>;
};

type AutocompleteValueProps = {
  defaultChildren: ReactNode;
  isPlaceholder: boolean;
  state: AutocompleteValueState;
};

type SearchCharacterType = {
  characters: AutoCompleteItem[];
};

export default function SearchCharacter({ characters }: SearchCharacterType) {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);

  const { contains } = useFilter({ sensitivity: 'base' });

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  // Fetch character data when selections change
  useEffect(() => {
    const fetchCharacters = async () => {
      if (selectedKeys.length === 0) {
        setSelectedCharacters([]);
        return;
      }

      const names = selectedKeys.map((key) => String(key));
      const fetchedCharacters = await getCharactersByNames(names);
      setSelectedCharacters(fetchedCharacters);
    };

    fetchCharacters();
  }, [selectedKeys]);

  return (
    <div className='flex flex-col items-center w-full'>
      {/* Display selected character tokens */}
      {selectedCharacters.length > 0 && (
        <div className='flex w-full max-w-sm overflow-x-auto px-4 snap-x snap-mandatory'>
          <div className='flex justify-center gap-6 pb-4'>
            {selectedCharacters.map((character) => (
              <div key={character.name} className='snap-center'>
                <CharacterToken character={character} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Autocomplete
        className='w-xs'
        placeholder='Select characters'
        selectionMode='multiple'
        variant='secondary'
        value={selectedKeys}
        onChange={(keys: Key | Key[] | null) => setSelectedKeys(keys as Key[])}
      >
        <Label>
          <h1 className='max-w-xs text-sm font-semibold leading-10 tracking-tight'>
            Search for a character
          </h1>
        </Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value>
            {({
              defaultChildren,
              isPlaceholder,
              state,
            }: AutocompleteValueProps) => {
              if (isPlaceholder || state.selectedItems.length === 0) {
                return defaultChildren;
              }
              const selectedItemsKeys = state.selectedItems.map(
                (item) => item.key,
              );
              return (
                <TagGroup
                  size='sm'
                  onRemove={onRemoveTags}
                  aria-label='Selected characters'
                >
                  <TagGroup.List>
                    {selectedItemsKeys.map((selectedItemKey: Key) => {
                      const characterName = characters.find(
                        (c) => c.id === selectedItemKey,
                      );
                      if (!characterName) return null;

                      return (
                        <Tag
                          key={characterName.id}
                          id={characterName.id}
                          className='p-1'
                          textValue={characterName.name}
                        >
                          <AnimatedShinyText>
                            {characterName.name}
                          </AnimatedShinyText>
                        </Tag>
                      );
                    })}
                  </TagGroup.List>
                </TagGroup>
              );
            }}
          </Autocomplete.Value>
          <Autocomplete.Indicator aria-label='Toggle dropdown' />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField
              autoFocus
              name='search'
              aria-label='Search for a character'
            >
              <SearchField.Group>
                <SearchField.SearchIcon aria-label='Search icon' />
                <SearchField.Input
                  placeholder='Search a character'
                  aria-label='Search for a character'
                />
                <SearchField.ClearButton aria-label='Clear search' />
              </SearchField.Group>
            </SearchField>
            <ListBox
              renderEmptyState={() => (
                <EmptyState>No characters found</EmptyState>
              )}
            >
              {characters.map((character) => (
                <ListBox.Item
                  key={character.id}
                  id={character.id}
                  textValue={character.name}
                >
                  {character.name}
                  <ListBox.ItemIndicator aria-label='Selected' />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
    </div>
  );
}
