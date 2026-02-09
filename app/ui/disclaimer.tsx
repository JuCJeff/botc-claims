'use client';

import { useState } from 'react';

import { Button, Disclosure, Link } from '@heroui/react';

const Disclaimer = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='w-full max-w-md px-4'>
      <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
        <Disclosure.Heading>
          <Button
            slot='trigger'
            variant='primary'
            size='sm'
            className='bg-background text-muted'
          >
            <p className='text-sm'>Disclaimer</p>
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body className='shadow-panel flex flex-col rounded-3xl bg-surface p-4 text-start'>
            <p className='text-sm text-muted p-2'>
              This is a fan made app and is not directly related to the official
              Pandemonium Institute. For further information please consult the{' '}
              <Link href='https://bloodontheclocktower.com/' target='_blank'>
                official website
              </Link>{' '}
              or their wonderful{' '}
              <Link
                href='https://wiki.bloodontheclocktower.com/Main_Page'
                target='_blank'
              >
                wiki page
              </Link>
              .
            </p>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
};

export default Disclaimer;
