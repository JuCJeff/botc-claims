'use client';

import {
  Accordion,
  Button,
  CheckboxGroup,
  Checkbox,
  Label,
} from '@heroui/react';
import { CHARACTER_TYPES } from '@/lib/constants';

type SelectCharacterTypeProps = {
  selectedCharacterTypes: string[];
  onSelectedCharacterTypesChange: (types: string[]) => void;
};

export default function SelectCharacterType({
  selectedCharacterTypes: selectedCharacterTypes,
  onSelectedCharacterTypesChange,
}: SelectCharacterTypeProps) {
  return (
    <div className='flex flex-col w-full max-w-sm'>
      <Accordion variant='surface'>
        <Accordion.Item>
          <Accordion.Heading>
            <Accordion.Trigger>
              <p className='text-primary'>
                {selectedCharacterTypes.length > 0
                  ? selectedCharacterTypes.join(', ')
                  : 'Character Type'}
              </p>
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>
              <CheckboxGroup
                name='character-types'
                className='text-start'
                variant='secondary'
                value={selectedCharacterTypes}
                onChange={(value) =>
                  onSelectedCharacterTypesChange(value as string[])
                }
              >
                <div className='flex items-center justify-between'>
                  <Label>Select character types</Label>
                  {selectedCharacterTypes.length > 0 && (
                    <Button
                      type='button'
                      variant='outline'
                      className='text-sm'
                      onClick={() => onSelectedCharacterTypesChange([])}
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {CHARACTER_TYPES.map((type) => (
                  <Checkbox value={type.name} key={type.name}>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <Label>{type.name}</Label>
                    </Checkbox.Content>
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
