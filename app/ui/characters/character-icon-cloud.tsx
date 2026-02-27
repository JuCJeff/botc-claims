'use client';

import { useIsClient, useLocalStorage } from 'usehooks-ts';

import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@heroui/react';
import { IconCloud } from '@/components/ui/icon-cloud';
import { Pointer } from '@/components/ui/pointer';

const CharacterIconCloud = ({ images }: { images: string[] }) => {
  const [showCloud, setShowCloud] = useLocalStorage('showIconCloud', false, {
    initializeWithValue: false,
  });
  const isClient = useIsClient();

  if (!isClient) return null;

  return (
    <>
      <Button
        variant='ghost'
        className='text-xs text-muted'
        onClick={() => setShowCloud((prev) => !prev)}
      >
        {showCloud ? 'Hide' : 'Show'} Icon Cloud
      </Button>
      <AnimatePresence>
        {showCloud && (
          <motion.div
            key='icon-cloud'
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            className='relative flex size-full items-center justify-center overflow-hidden'
          >
            <IconCloud images={images} iconSize={80} />
            <Pointer className='fill-primary' />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CharacterIconCloud;
