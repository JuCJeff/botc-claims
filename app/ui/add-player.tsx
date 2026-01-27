'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button, Form, Input, Label, Accordion, Modal } from '@heroui/react';
import { TextAnimate } from '@/components/ui/text-animate';

import SearchCharacter from './search-character';

import type { AutoCompleteItem, Player, Character } from '@/utils/types';

type AddUserProps = {
  characters: AutoCompleteItem[];
};

const AddPlayer = ({ characters }: AddUserProps) => {
  const [name, setName] = useState('');
  const [playerList, setPlayerList] = useState<Player[]>([]);

  const handleAddName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name.trim() === '') return; // Prevent adding empty items

    const nameObject = {
      id: crypto.randomUUID(),
      name: name.trim(),
    };

    setPlayerList((prevNames) => [...prevNames, nameObject]);

    setName('');
  };

  const handleRemove = (id: string) => {
    setPlayerList((prevNames) =>
      prevNames.filter((player) => player.id !== id),
    );
  };

  const handleCharactersChange = (
    playerId: string,
    characters: Character[],
  ) => {
    setPlayerList((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId
          ? { ...player, selectedCharacters: characters }
          : player,
      ),
    );
  };

  const handleClearPlayers = () => {
    setPlayerList([]);
  };

  return (
    <div className='flex flex-col items-center w-full'>
      <Form className='flex gap-2 items-center my-4' onSubmit={handleAddName}>
        <Label htmlFor='name' className='text-lg text-primary'>
          <TextAnimate animation='fadeIn' by='line' as='p'>
            Player
          </TextAnimate>
        </Label>

        <Input
          id='name'
          className='w-64'
          variant='secondary'
          placeholder='Enter a player name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          type='text'
        />

        <Button type='submit' className='bg-primary text-background'>
          Add
        </Button>
      </Form>

      <div className='flex flex-col gap-2'>
        {playerList.map((player) => (
          <Accordion
            key={player.id}
            variant='surface'
            className='w-sm'
          >
            <Accordion.Item>
              <Accordion.Heading>
                <Accordion.Trigger className='font-semibold'>
                  <div className='flex items-center justify-center gap-4'>
                    <p>{player.name}</p>
                    <div className='flex gap-0'>
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
                    characters={characters}
                    onCharactersChange={(chars) =>
                      handleCharactersChange(player.id, chars)
                    }
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
                            Are you sure you want to remove <b>{player.name}</b>{' '}
                            as a player?
                          </p>
                        </Modal.Body>
                        <Modal.Footer className='flex gap-2'>
                          <Button
                            variant='outline'
                            slot='close'
                            className='flex-1'
                          >
                            Cancel
                          </Button>
                          <Button
                            variant='danger'
                            slot='close'
                            onClick={() => handleRemove(player.id)}
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
        ))}
      </div>

      {playerList.length !== 0 && (
        <Modal>
          <Button variant='outline' className='my-4'>
            Clear Players
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className='sm:max-w-90'>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Clear All Players</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p>Are you sure you want to remove all players?</p>
                </Modal.Body>
                <Modal.Footer className='flex gap-2'>
                  <Button variant='outline' slot='close' className='flex-1'>
                    Cancel
                  </Button>
                  <Button
                    variant='danger'
                    slot='close'
                    onClick={handleClearPlayers}
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
    </div>
  );
};

export default AddPlayer;
