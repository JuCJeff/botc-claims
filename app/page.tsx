import { Suspense } from 'react';
import { Spinner } from '@heroui/react';

import Header from './ui/header';
import Disclaimer from './ui/disclaimer';
import GameSetupContainer from './containers/game-setup-container';

export default function Page() {
  return (
    <div className='flex items-center justify-center font-sans'>
      <main className='flex w-full max-w-3xl flex-col items-center'>
        <div className='mt-8 flex flex-col items-center text-center'>
          <Header />
          <Disclaimer />
          <Suspense fallback={<Spinner className='my-4 text-primary' />}>
            <GameSetupContainer />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
