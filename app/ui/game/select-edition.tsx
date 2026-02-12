'use client';

import {
  Accordion,
  Button,
  CheckboxGroup,
  Checkbox,
  Label,
  Description,
} from '@heroui/react';
import { BASE_EDITIONS } from '@/lib/constants';

type SelectEditionProps = {
  selectedEditions: string[];
  onSelectedEditionsChange: (editions: string[]) => void;
};

export default function SelectEdition({
  selectedEditions,
  onSelectedEditionsChange,
}: SelectEditionProps) {
  return (
    <Accordion className='flex flex-col w-full max-w-sm' variant='surface'>
      <Accordion.Item>
        <Accordion.Heading>
          <Accordion.Trigger>
            <p className='text-primary'>
              {selectedEditions.length > 0
                ? selectedEditions.join(', ')
                : 'Select Edition'}
            </p>
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            <CheckboxGroup
              name='editions'
              className='text-start'
              variant='secondary'
              value={selectedEditions}
              onChange={(value) => onSelectedEditionsChange(value as string[])}
            >
              <div className='flex items-center justify-between'>
                <Label>Select the game edition</Label>
                {selectedEditions.length > 0 && (
                  <Button
                    type='button'
                    variant='outline'
                    className='text-sm'
                    onClick={() => onSelectedEditionsChange([])}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {BASE_EDITIONS.map((edition) => (
                <Checkbox value={edition.name} key={edition.name}>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label>{edition.name}</Label>
                    {edition.description && (
                      <Description>{edition.description}</Description>
                    )}
                  </Checkbox.Content>
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
