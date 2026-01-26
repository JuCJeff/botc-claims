'use client';

import Image from 'next/image';
import { dumbledor } from '@/app/fonts';
import { motion } from 'motion/react';

import type { Character } from '@/utils/types';

interface CharacterDetailsType {
  character: Character;
}

const CharacterToken = ({ character }: CharacterDetailsType) => {
  const { name, icon_url } = character;

  return (
    <div className={`flex flex-col items-center gap-4 m-4`}>
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
    </div>
  );
};

export default CharacterToken;
