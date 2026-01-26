import { getCharacterNames } from '@/lib/character-queries';
import { characterNamesToAutoCompleteItems } from '@/utils/formatters';
import AddPlayer from './add-player';

export default async function AddPlayerWrapper() {
  const characterNames = await getCharacterNames();
  const characters = characterNamesToAutoCompleteItems(characterNames);

  return <AddPlayer characters={characters} />;
}
