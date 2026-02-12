'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { Reorder, useDragControls } from 'motion/react';
import { Button, Accordion, Modal, TextArea } from '@heroui/react';

import SearchCharacter from '../characters/search-character';
import ReorderIcon from './reorder-icon';

import type { AutoCompleteItem, Player, Character } from '@/utils/types';

type PlayerItemProps = {
  player: Player;
  characters: AutoCompleteItem[];
  resetKey: number;
  onRemove: (id: string) => void;
  onCharactersChange: (playerId: string, characters: Character[]) => void;
  onNotesChange: (playerId: string, notes: string) => void;
};

const PlayerItem = ({
  player,
  characters,
  resetKey,
  onRemove,
  onCharactersChange,
  onNotesChange,
}: PlayerItemProps) => {
  const controls = useDragControls();
  const [localNotes, setLocalNotes] = useState(player.notes ?? '');
  const [prevNotes, setPrevNotes] = useState(player.notes);

  // Sync local state when parent changes notes (e.g., clearing)
  if (player.notes !== prevNotes) {
    setPrevNotes(player.notes);
    setLocalNotes(player.notes ?? '');
  }

  return (
    <Reorder.Item
      value={player}
      id={player.id}
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{ originY: 0 }}
      dragListener={false}
      dragControls={controls}
    >
      <Accordion variant='surface' className='w-sm'>
        <Accordion.Item>
          <Accordion.Heading>
            <Accordion.Trigger className='font-semibold'>
              <div className='flex items-center justify-center gap-4'>
                <div
                  className='relative cursor-grab active:cursor-grabbing touch-none p-1'
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    controls.start(e);
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='absolute inset-0 -m-3' />
                  <ReorderIcon />
                </div>

                <p className='text-base'>{player.name}</p>

                <div className='flex'>
                  {player.selectedCharacters &&
                    player.selectedCharacters.length > 0 &&
                    player.selectedCharacters.map((character) => (
                      <Image
                        key={character.name}
                        src={character.icon_url}
                        alt={character.name}
                        width={591}
                        height={591}
                        className='rounded-full w-8 h-8'
                      />
                    ))}
                </div>
              </div>
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>

          <Accordion.Panel>
            <Accordion.Body>
              <SearchCharacter
                key={`search-${resetKey}`}
                characters={characters}
                initialCharacters={player.selectedCharacters}
                onCharactersChange={(chars) =>
                  onCharactersChange(player.id, chars)
                }
              />

              <TextArea
                key={`notes-${resetKey}`}
                className='w-xs mt-4 bg-background text-base'
                placeholder='Notes'
                rows={3}
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                onBlur={() => onNotesChange(player.id, localNotes)}
              />
            </Accordion.Body>

            <Modal>
              <Button variant='danger-soft' className='mb-4' size='sm'>
                Remove Player
              </Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog className='sm:max-w-90'>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>Remove Player</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <p>
                        Are you sure you want to remove <b>{player.name}</b> as
                        a player?
                      </p>
                    </Modal.Body>
                    <Modal.Footer className='flex gap-2'>
                      <Button variant='outline' slot='close' className='flex-1'>
                        Cancel
                      </Button>
                      <Button
                        variant='danger'
                        slot='close'
                        onClick={() => onRemove(player.id)}
                        className='flex-1'
                      >
                        Confirm
                      </Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Reorder.Item>
  );
};

export default memo(PlayerItem);
