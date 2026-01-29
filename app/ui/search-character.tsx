'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { animate } from 'motion/react';
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
  onCharactersChange?: (characters: Character[]) => void;
};

// Cache individual characters by name
const characterCache = new Map<string, Character>();

export default function SearchCharacter({
  characters,
  onCharactersChange,
}: SearchCharacterType) {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const cacheRef = useRef(characterCache);
  const triggerRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const scrollToBottom = useCallback((element: HTMLElement): Promise<void> => {
    return new Promise((resolve) => {
      // Prevent multiple simultaneous scrolls
      if (isScrollingRef.current) {
        resolve();
        return;
      }

      const extraPadding = 16; // Small extra space above trigger
      const bottomPadding = element.offsetHeight + extraPadding;
      const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
      const elementRect = element.getBoundingClientRect();

      // Target: position trigger above the keyboard area
      let targetY =
        elementRect.top +
        window.scrollY -
        visibleHeight +
        element.offsetHeight +
        bottomPadding;

      // Clamp to valid scroll bounds
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(targetY, maxScroll));

      // Skip if already at target position
      if (Math.abs(window.scrollY - targetY) < 5) {
        resolve();
        return;
      }

      isScrollingRef.current = true;

      animate(window.scrollY, targetY, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        onUpdate: (value: number) => window.scrollTo(0, value),
        onComplete: () => {
          isScrollingRef.current = false;
          resolve();
        },
      });
    });
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    // On mobile: scroll when user types
    if (isMobile && triggerRef.current) {
      scrollToBottom(triggerRef.current);
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      return;
    }

    // On mobile: scroll first, then open popover
    if (isMobile && triggerRef.current) {
      await scrollToBottom(triggerRef.current);
    }

    setIsOpen(true);
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
        onChange={(keys: Key | Key[] | null) => {
          setSelectedKeys(keys as Key[]);
          setSearchValue('');
          setIsOpen(false);
        }}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
      >
        <Label className='sr-only'>Search for a character</Label>
        <Autocomplete.Trigger ref={triggerRef} className='bg-background'>
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
                          className='py-1 px-2'
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
        <Autocomplete.Popover
          className='bg-background'
          placement={isMobile ? 'top' : 'bottom'}
          shouldFlip={!isMobile}
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
              className='min-h-12 max-h-64 overflow-y-auto'
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
