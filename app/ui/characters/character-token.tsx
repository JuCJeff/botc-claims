'use client';

import Image from 'next/image';
import { dumbledor } from '@/app/fonts';
import { motion } from 'motion/react';
import { Button, Modal } from '@heroui/react';

import type { Character } from '@/utils/types';

type CharacterTokenProp = {
  character: Character;
};

const CharacterToken = ({ character }: CharacterTokenProp) => {
  const { name, icon_url, type, ability, flavor_text } = character;

  return (
    <div className={`flex flex-col items-center gap-4 mx-4 py-1`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.1,
          scale: { type: 'spring', visualDuration: 0.1, bounce: 0.1 },
        }}
      >
        {/* TOKEN */}
        <div className='relative w-70 aspect-square'>
          {/* Background token */}
          <Image
            src='/blank_token.png'
            alt='Blank token'
            fill
            sizes='280px'
            className='object-contain'
          />

          <div className='absolute inset-0 flex flex-col items-center justify-center text-center px-6'>
            {/* Icon */}
            <Image
              src={icon_url}
              alt={`Icon for ${name}`}
              width={240}
              height={240}
              priority
              className='
    absolute
    top-1/2
    left-1/2
    -translate-x-1/2
    -translate-y-[calc(50%+10px)]
  '
            />

            {/* Curved Name */}
            <svg
              viewBox='0 0 300 300'
              className='absolute inset-0 pointer-events-none'
            >
              <defs>
                <path id='bottomArc' d='M 40,150 A 110,110 0 0 0 260,150' />
              </defs>

              <text
                className={`
              ${dumbledor.className}
      fill-gray-900
      tracking-wider
      text-3xl
    `}
              >
                <textPath
                  href='#bottomArc'
                  startOffset='50%'
                  textAnchor='middle'
                >
                  {name.toUpperCase()}
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </motion.div>

      <Modal>
        <Button variant='outline' size='sm' className='text-xs'>
          Details
        </Button>
        <Modal.Backdrop variant='blur'>
          <Modal.Container placement='center'>
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Character details</Modal.Heading>
              </Modal.Header>
              <Modal.Body className='flex flex-col items-center text-center text-foreground px-4'>
                <Image
                  src={icon_url}
                  alt={`Icon for ${name}`}
                  width={256}
                  height={256}
                  sizes='96px'
                  className='w-24 h-24'
                />
                <div className='flex flex-col gap-3'>
                  <p className='text-lg font-bold'>{name}</p>
                  <p className='text-sm font-semibold'>{type}</p>
                  <p className='text-sm'>{ability}</p>
                  <p className='text-sm font-light text-muted italic'>
                    {flavor_text}
                  </p>
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
};

export default CharacterToken;
