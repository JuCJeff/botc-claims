'use client';

import Image from 'next/image';

import { motion } from 'motion/react';

const Header = () => {
  return (
    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
      <Image
        src='/botc_head.webp'
        alt='Blood on the Clocktower logo'
        width={414}
        height={443}
        priority
        className='h-auto w-28'
      />
    </motion.div>
  );
};

export default Header;
