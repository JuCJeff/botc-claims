import {
  getCharacterNames,
  getCharactersByBaseEdition,
} from '@/lib/character-queries';
import { characterNamesToAutoCompleteItems } from '@/utils/formatters';
import GameSetup from '@/app/ui/game-setup';

import { BASE_EDITIONS } from '@/lib/constants';

const editionNames = BASE_EDITIONS.map((edition) => edition.name);

export default async function GameSetupContainer() {
  const [characterNames, ...editionCharacters] = await Promise.all([
    getCharacterNames(),
    ...editionNames.map((edition) => getCharactersByBaseEdition(edition)),
  ]);

  const allCharacters = characterNamesToAutoCompleteItems(
    characterNames.sort(),
  );

  const editionImages: Record<string, string[]> = {};
  const editionCharacterNames: Record<string, string[]> = {};

  editionNames.forEach((edition, i) => {
    editionImages[edition] = editionCharacters[i].map((c) => c.icon_url);
    editionCharacterNames[edition] = [...editionCharacters[i]]
      .sort((a, b) => a.id - b.id)
      .map((c) => c.name);
  });

  return (
    <GameSetup
      allCharacters={allCharacters}
      editionImages={editionImages}
      editionCharacterNames={editionCharacterNames}
    />
  );
}
