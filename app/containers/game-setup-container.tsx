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
    ...BASE_EDITIONS.map((edition) =>
      getCharactersByBaseEdition(edition.queryValue),
    ),
  ]);

  const allCharacters = characterNamesToAutoCompleteItems(
    characterNames.sort(),
  );

  const editionImages: Record<string, string[]> = {};
  const editionCharacterNames: Record<string, string[]> = {};

  editionNames.forEach((edition, index) => {
    editionCharacterNames[edition] = [...editionCharacters[index]]
      .sort((a, b) => a.id - b.id)
      .map((character) => character.name);

    editionImages[edition] = editionCharacters[index].map(
      (character) => character.icon_url,
    );
  });

  return (
    <GameSetup
      allCharacters={allCharacters}
      editionCharacterNames={editionCharacterNames}
      editionImages={editionImages}
    />
  );
}
