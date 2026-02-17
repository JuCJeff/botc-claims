import {
  getCharacterNames,
  getCharactersByBaseEdition,
  getCharactersByCharacterType,
} from '@/lib/character-queries';
import { characterNamesToAutoCompleteItems } from '@/utils/formatters';
import GameSetup from '@/app/ui/game/game-setup';

import { BASE_EDITIONS, CHARACTER_TYPES } from '@/lib/constants';

const editionNames = BASE_EDITIONS.map((edition) => edition.name);
const typeNames = CHARACTER_TYPES.map((type) => type.name);

export default async function GameSetupContainer() {
  const [characterNames, ...editionAndTypeCharacters] = await Promise.all([
    getCharacterNames(),
    ...BASE_EDITIONS.map((edition) =>
      getCharactersByBaseEdition(edition.queryValue),
    ),
    ...CHARACTER_TYPES.map((type) =>
      getCharactersByCharacterType(type.queryValue),
    ),
  ]);

  const allCharacters = characterNamesToAutoCompleteItems(
    characterNames.sort(),
  );

  const editionCharacterNames: Record<string, string[]> = {};
  const characterIconMap: Record<string, string> = {};

  editionNames.forEach((edition, index) => {
    const characters = editionAndTypeCharacters[index];
    editionCharacterNames[edition] = [...characters]
      .sort((a, b) => a.id - b.id)
      .map((character) => character.name);

    characters.forEach((character) => {
      characterIconMap[character.name] = character.icon_url;
    });
  });

  const typeCharacterNames: Record<string, string[]> = {};

  typeNames.forEach((type, index) => {
    const characters = editionAndTypeCharacters[editionNames.length + index];
    typeCharacterNames[type] = [...characters]
      .sort((a, b) => a.id - b.id)
      .map((character) => character.name);

    characters.forEach((character) => {
      characterIconMap[character.name] = character.icon_url;
    });
  });

  return (
    <GameSetup
      allCharacters={allCharacters}
      editionCharacterNames={editionCharacterNames}
      typeCharacterNames={typeCharacterNames}
      characterIconMap={characterIconMap}
    />
  );
}
