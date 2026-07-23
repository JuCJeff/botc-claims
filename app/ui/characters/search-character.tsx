'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Autocomplete,
  Button,
  EmptyState,
  Label,
  ListBox,
  Modal,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from '@heroui/react';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { getCharacterByName } from '@/lib/character-queries';
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
  initialCharacters?: Character[];
  onCharactersChange?: (characters: Character[]) => void;
};

// Cache individual characters by name
const characterCache = new Map<string, Character>();

export default function SearchCharacter({
  characters,
  initialCharacters = [],
  onCharactersChange,
}: SearchCharacterType) {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>(() =>
    initialCharacters.map((c) => c.name),
  );
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>(
    () => {
      // Pre-populate cache with initial characters
      initialCharacters.forEach((c) => characterCache.set(c.name, c));
      return initialCharacters;
    },
  );
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTokenIndex, setActiveTokenIndex] = useState(0);
  const cacheRef = useRef(characterCache);
  const tokenScrollRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleTokenScroll = () => {
    const container = tokenScrollRef.current;
    if (!container) return;
    const itemWidth = container.scrollWidth / selectedCharacters.length;
    setActiveTokenIndex(Math.round(container.scrollLeft / itemWidth));
  };

  const { contains } = useFilter({ sensitivity: 'base' });

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  // Fetch character data when selections change
  useEffect(() => {
    const fetchCharacters = async () => {
      if (selectedKeys.length === 0) {
        setSelectedCharacters([]);
        onCharactersChange?.([]);
        return;
      }

      const names = selectedKeys.map((key) => String(key));
      const cachedChars: Character[] = [];
      const missingNames: string[] = [];

      // Check which characters are already cached
      names.forEach((name) => {
        const cached = cacheRef.current.get(name);
        if (cached) {
          cachedChars.push(cached);
        } else {
          missingNames.push(name);
        }
      });

      // Fetch only missing characters individually
      let allCharacters = [...cachedChars];
      if (missingNames.length > 0) {
        const fetchPromises = missingNames.map((name) =>
          getCharacterByName(name),
        );
        const fetchedCharacters = await Promise.all(fetchPromises);

        // Cache each fetched character individually
        fetchedCharacters.forEach((char) => {
          if (char) {
            cacheRef.current.set(char.name, char);
          }
        });

        allCharacters = [
          ...cachedChars,
          ...fetchedCharacters.filter(
            (char): char is Character => char !== null,
          ),
        ];
      }

      setSelectedCharacters(allCharacters);
      onCharactersChange?.(allCharacters);
    };

    fetchCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeys]);

  return (
    <div className='flex flex-col items-center w-full'>
      <Autocomplete
        className='min-w-xs my-2'
        placeholder='Select characters'
        selectionMode='multiple'
        variant='secondary'
        value={selectedKeys}
        onChange={(keys: Key | Key[] | null) => {
          setSelectedKeys(keys as Key[]);
          setSearchValue('');
        }}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <Label className='sr-only'>Search for a character</Label>
        <Autocomplete.Trigger className='bg-background'>
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
                          className='px-2 **:data-[slot=tag-remove-button]:p-1.5' // increase the click area of the remove x button
                          textValue={characterName.name}
                        >
                          <AnimatedShinyText className='text-sm px-1'>
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
        <Autocomplete.Popover
          className='bg-background'
          placement='bottom'
        >
          <Autocomplete.Filter filter={contains}>
            <SearchField
              autoFocus
              name='search'
              aria-label='Search for a character'
              value={searchValue}
              onChange={handleSearchChange}
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
              className='h-64 overflow-y-auto'
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

      {selectedCharacters.length > 0 && (
        <Modal>
          <Button variant='outline' size='sm' className='mb-4 text-xs'>
            Clear Selections
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className='sm:max-w-90'>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Clear Selection</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p>Are you sure you want to clear the character selection?</p>
                </Modal.Body>
                <Modal.Footer className='flex gap-2'>
                  <Button variant='outline' slot='close' className='flex-1'>
                    Cancel
                  </Button>
                  <Button
                    variant='danger'
                    slot='close'
                    onClick={() => setSelectedKeys([])}
                    className='flex-1'
                  >
                    Confirm
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      )}

      {/* Display selected character tokens */}
      {selectedCharacters.length > 0 && (
        <>
          <div
            ref={tokenScrollRef}
            className='flex w-full overflow-x-auto snap-x snap-mandatory'
            onScroll={handleTokenScroll}
          >
            {selectedCharacters.map((character) => (
              <div key={character.name} className='snap-center flex-none w-full flex justify-center'>
                <CharacterToken character={character} />
              </div>
            ))}
          </div>
          {selectedCharacters.length > 1 && (
            <div className='flex gap-1.5 my-2 px-2.5 py-1.5 rounded-full bg-muted/25'>
              {selectedCharacters.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === activeTokenIndex ? 'bg-foreground' : 'bg-foreground/25'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
