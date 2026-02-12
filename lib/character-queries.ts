'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCharacters() {
  const supabase = await createClient();
  const { data: characters } = await supabase.from('characters').select();

  return characters;
}

export async function getCharacterNames() {
  const supabase = await createClient();
  const { data: characterNames } = await supabase
    .from('characters')
    .select('name');

  return characterNames?.map((char) => char.name) || [];
}

export async function getCharacterByName(name: string) {
  const supabase = await createClient();

  const { data: character } = await supabase
    .from('characters')
    .select()
    .eq('name', name)
    .single();

  return character;
}

export async function getCharactersByNames(names: string[]) {
  const supabase = await createClient();

  const { data: characters, error } = await supabase
    .from('characters')
    .select()
    .in('name', names);

  if (error) {
    throw error;
  }

  return characters;
}

export async function getCharactersByBaseEdition(name: string | null) {
  const supabase = await createClient();

  let query = supabase.from('characters').select();
  // Handle carousel edition characters, where the base_edition field is null
  query = name === null ? query.is('base_edition', null) : query.eq('base_edition', name);

  const { data: characters, error } = await query;

  if (error) {
    throw error;
  }

  return characters;
}
