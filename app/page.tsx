import { Suspense } from 'react';
import { Spinner } from '@heroui/react';

import Header from './ui/header';
import AddPlayerWrapper from './ui/add-player-wrapper';

export default function Page() {
  return (
    <div className='flex items-center justify-center font-sans'>
      <main className='flex w-full max-w-3xl flex-col items-center'>
        <div className='mt-8 flex flex-col items-center text-center'>
          <Header />
          <Suspense fallback={<Spinner color='current' />}>
            <AddPlayerWrapper />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
