'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import { Reorder } from 'motion/react';
import { Button, Form, Input, Label, Modal } from '@heroui/react';
import { TextAnimate } from '@/components/ui/text-animate';

import PlayerItem from './player-item';

import type { AutoCompleteItem, Player, Character } from '@/utils/types';

type AddUserProps = {
  characters: AutoCompleteItem[];
};

const AddPlayer = ({ characters }: AddUserProps) => {
  const [name, setName] = useState('');
  const [playerList, setPlayerList] = useLocalStorage<Player[]>(
    'playerList',
    [],
    { initializeWithValue: false },
  );
  const [resetKey, setResetKey] = useState(0);

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

  const handleRemove = useCallback(
    (id: string) => {
      setPlayerList((prevNames) =>
        prevNames.filter((player) => player.id !== id),
      );
    },
    [setPlayerList],
  );

  const handleCharactersChange = useCallback(
    (playerId: string, characters: Character[]) => {
      setPlayerList((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === playerId
            ? { ...player, selectedCharacters: characters }
            : player,
        ),
      );
    },
    [setPlayerList],
  );

  const handleNotesChange = useCallback(
    (playerId: string, notes: string) => {
      setPlayerList((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === playerId ? { ...player, notes } : player,
        ),
      );
    },
    [setPlayerList],
  );

  const handleClearPlayers = () => {
    setPlayerList([]);
  };

  const handleClearAllSelections = () => {
    setPlayerList((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        selectedCharacters: [],
        notes: '',
      })),
    );
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className='flex flex-col items-center w-full'>
      <Form className='flex gap-2 items-center my-4' onSubmit={handleAddName}>
        <Label htmlFor='name' className='text-lg text-primary'>
          <TextAnimate animation='fadeIn' by='line' as='p' once>
            Player
          </TextAnimate>
        </Label>

        <Input
          id='name'
          className='w-64'
          variant='primary'
          placeholder='Enter a player name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          type='text'
        />

        <Button type='submit' className='bg-primary text-background'>
          Add
        </Button>
      </Form>

      <Reorder.Group
        axis='y'
        values={playerList}
        onReorder={setPlayerList}
        className='flex flex-col gap-2'
      >
        {playerList.map((player) => (
          <PlayerItem
            key={player.id}
            player={player}
            characters={characters}
            resetKey={resetKey}
            onRemove={handleRemove}
            onCharactersChange={handleCharactersChange}
            onNotesChange={handleNotesChange}
          />
        ))}
      </Reorder.Group>

      {playerList.length !== 0 && (
        <div className='flex gap-2 my-4'>
          <Modal>
            <Button variant='outline'>Clear Selections</Button>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog className='sm:max-w-90'>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>Clear All Selections</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <p>
                      Are you sure you want to clear all character selections
                      and notes?
                    </p>
                  </Modal.Body>
                  <Modal.Footer className='flex gap-2'>
                    <Button variant='outline' slot='close' className='flex-1'>
                      Cancel
                    </Button>
                    <Button
                      variant='danger'
                      slot='close'
                      onClick={handleClearAllSelections}
                      className='flex-1'
                    >
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
          <Modal>
            <Button variant='outline'>Clear Players</Button>
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
        </div>
      )}
    </div>
  );
};

export default AddPlayer;
