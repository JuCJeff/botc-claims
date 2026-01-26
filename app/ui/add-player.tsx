'use client';

import { useState } from 'react';
import { Button, Form, Input, Label, Accordion, Modal } from '@heroui/react';
import { TextAnimate } from '@/components/ui/text-animate';

import SearchCharacter from './search-character';

import type { AutoCompleteItem, Player } from '@/utils/types';

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
          <Accordion key={player.id} variant='surface' className='w-sm'>
            <Accordion.Item>
              <Accordion.Heading>
                <Accordion.Trigger>
                  <p>{player.name}</p>
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>

              <Accordion.Panel>
                <Accordion.Body>
                  <SearchCharacter characters={characters} />
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
          <Button variant='outline' className='mt-4'>
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
